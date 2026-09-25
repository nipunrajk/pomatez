import crypto from "crypto";
import fs from "fs";
import http from "http";
import { AddressInfo } from "net";

/**
 * Google Calendar sync for the main process: desktop OAuth (loopback
 * redirect + PKCE), encrypted token storage, silent refresh, and fetching
 * the primary calendar's events. Tokens never leave this module; the
 * renderer only receives status and normalized events.
 *
 * Electron specifics (shell, safeStorage, electron-store, the window) are
 * injected so this can run and be tested in plain Node.
 */

export type CalendarColorTheme =
  | "blue"
  | "sand"
  | "sage"
  | "mint"
  | "terracotta";

export type CalendarEvent = {
  id: string;
  title: string;
  /** Local day the event starts on, `YYYY-MM-DD`. */
  date: string;
  /** ISO date-time, or `YYYY-MM-DD` for all-day events. */
  start: string;
  end: string;
  allDay: boolean;
  colorTheme: CalendarColorTheme;
  link?: string;
};

export type CalendarError =
  | "config"
  | "encryption"
  | "denied"
  | "timeout"
  | "reauth"
  | "network";

export type CalendarStatus = {
  configured: boolean;
  connected: boolean;
  pending: boolean;
  email: string | null;
  error: CalendarError | null;
};

type Config = {
  clientId: string;
  clientSecret?: string;
  authUrl: string;
  tokenUrl: string;
  revokeUrl: string;
  apiBase: string;
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: number;
  email?: string;
};

export type GoogleCalendarDeps = {
  /** Candidate paths for google-oauth.json, first existing one wins. */
  configPaths: () => string[];
  openExternal: (url: string) => void | Promise<void>;
  encryptionAvailable: () => boolean;
  encrypt: (plain: string) => string;
  decrypt: (cipher: string) => string;
  readSecret: () => string | undefined;
  writeSecret: (cipher: string) => void;
  clearSecret: () => void;
  onStatus: (status: CalendarStatus) => void;
  onEvents: (key: string, events: CalendarEvent[]) => void;
  now?: () => number;
  connectTimeoutMs?: number;
};

export const SCOPE =
  "https://www.googleapis.com/auth/calendar.events.readonly";

const DEFAULT_ENDPOINTS = {
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  revokeUrl: "https://oauth2.googleapis.com/revoke",
  apiBase: "https://www.googleapis.com/calendar/v3",
};

/** Google event colorId (1-11) to the editorial palette. */
export const colorThemeFor = (colorId?: string): CalendarColorTheme => {
  switch (colorId) {
    case "2":
    case "10":
      return "sage";
    case "5":
    case "8":
      return "sand";
    case "7":
      return "mint";
    case "4":
    case "6":
    case "11":
      return "terracotta";
    default:
      return "blue";
  }
};

const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(
    2,
    "0"
  )}-${`${date.getDate()}`.padStart(2, "0")}`;

type RawEvent = {
  id: string;
  status?: string;
  summary?: string;
  colorId?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

export const normalizeEvent = (raw: RawEvent): CalendarEvent | null => {
  if (raw.status === "cancelled" || !raw.start) return null;
  const allDay = !!raw.start.date && !raw.start.dateTime;
  const start = raw.start.dateTime || raw.start.date;
  const end = raw.end?.dateTime || raw.end?.date || start;
  if (!start || !end) return null;
  return {
    id: raw.id,
    title: raw.summary || "",
    date: allDay ? start : localDayKey(new Date(start)),
    start,
    end,
    allDay,
    colorTheme: colorThemeFor(raw.colorId),
    link: raw.htmlLink,
  };
};

const base64url = (buf: Buffer) =>
  buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c] as string)
  );

const page = (title: string, body: string) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(
    title
  )}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F5F5E7;color:#1C1C1A;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:28rem;padding:2rem;text-align:center}h1{font:500 30px/1.2 Georgia,serif;color:#3A5F8A;margin:0 0 .5rem}</style></head><body><main><h1>${escapeHtml(
    title
  )}</h1><p>${escapeHtml(body)}</p></main></body></html>`;

type TokenRequestError = Error & { status: number; code?: string };

// A plain Error, not a subclass: main compiles to ES5, where subclasses of
// Error lose their prototype and `instanceof` checks silently fail.
const tokenRequestError = (status: number, code?: string) =>
  Object.assign(
    new Error(
      `Token request failed (${status}${code ? `: ${code}` : ""})`
    ),
    { status, code }
  ) as TokenRequestError;

const isInvalidGrant = (error: unknown) =>
  (error as TokenRequestError)?.code === "invalid_grant";

export const createGoogleCalendar = (deps: GoogleCalendarDeps) => {
  const now = deps.now || Date.now;
  const connectTimeoutMs = deps.connectTimeoutMs ?? 5 * 60 * 1000;

  let lastError: CalendarError | null = null;
  let pending: {
    server: http.Server;
    url: string;
    timer: NodeJS.Timeout;
  } | null = null;
  let refreshing: Promise<Tokens | null> | null = null;

  const loadConfig = (): Config | null => {
    for (const file of deps.configPaths()) {
      try {
        if (!fs.existsSync(file)) continue;
        const raw = JSON.parse(fs.readFileSync(file, "utf8"));
        if (typeof raw.clientId !== "string" || !raw.clientId) {
          return null;
        }
        return {
          ...DEFAULT_ENDPOINTS,
          ...raw,
        };
      } catch (error) {
        console.error(
          "[GoogleCalendar] Unreadable config",
          file,
          error
        );
        return null;
      }
    }
    return null;
  };

  const readTokens = (): Tokens | null => {
    const cipher = deps.readSecret();
    if (!cipher) return null;
    try {
      return JSON.parse(deps.decrypt(cipher));
    } catch (error) {
      console.error("[GoogleCalendar] Stored tokens unreadable", error);
      return null;
    }
  };

  const writeTokens = (tokens: Tokens) =>
    deps.writeSecret(deps.encrypt(JSON.stringify(tokens)));

  const status = (): CalendarStatus => {
    const tokens = readTokens();
    return {
      configured: !!loadConfig(),
      connected: !!tokens,
      pending: !!pending,
      email: tokens?.email ?? null,
      error: lastError,
    };
  };

  const emitStatus = () => deps.onStatus(status());

  const postForm = async (
    url: string,
    form: Record<string, string>
  ) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(form).toString(),
    });
    const body = (await res.json().catch(() => ({}))) as Record<
      string,
      any
    >;
    if (!res.ok) throw tokenRequestError(res.status, body.error);
    return body;
  };

  const finishConnect = (error: CalendarError | null) => {
    if (!pending) return;
    clearTimeout(pending.timer);
    const { server } = pending;
    pending = null;
    server.close();
    // Drop the browser's keep-alive socket so the port is released now.
    (server as any).closeAllConnections?.();
    lastError = error;
    emitStatus();
  };

  const respond = (
    res: http.ServerResponse,
    code: number,
    title: string,
    body: string
  ) => {
    res.writeHead(code, {
      "Content-Type": "text/html; charset=utf-8",
      Connection: "close",
    });
    res.end(page(title, body));
  };

  const connect = async () => {
    const config = loadConfig();
    if (!config) {
      lastError = "config";
      return emitStatus();
    }
    if (!deps.encryptionAvailable()) {
      lastError = "encryption";
      return emitStatus();
    }
    // One sign-in at a time: bring the open consent page back instead.
    if (pending) return deps.openExternal(pending.url);

    const verifier = base64url(crypto.randomBytes(32));
    const challenge = base64url(
      crypto.createHash("sha256").update(verifier).digest()
    );
    const state = base64url(crypto.randomBytes(16));

    const server = http.createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      if (url.pathname !== "/oauth2callback") {
        res.writeHead(404, { Connection: "close" });
        return res.end();
      }
      // A mismatched state isn't our sign-in (possible CSRF): refuse it
      // and keep waiting for the real redirect.
      if (url.searchParams.get("state") !== state) {
        return respond(
          res,
          400,
          "Sign-in not recognised",
          "This link doesn't match the sign-in Pomatez started. Please try again from the app."
        );
      }
      const oauthError = url.searchParams.get("error");
      const code = url.searchParams.get("code");
      if (oauthError || !code) {
        respond(
          res,
          200,
          "Not connected",
          "Google Calendar wasn't connected. You can close this tab and try again from Pomatez."
        );
        return finishConnect("denied");
      }
      postForm(config.tokenUrl, {
        code,
        client_id: config.clientId,
        ...(config.clientSecret && {
          client_secret: config.clientSecret,
        }),
        code_verifier: verifier,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      })
        .then((body) => {
          if (!body.refresh_token || !body.access_token) {
            throw tokenRequestError(200, "missing_refresh_token");
          }
          writeTokens({
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
            expiresAt: now() + (Number(body.expires_in) || 3600) * 1000,
          });
          respond(
            res,
            200,
            "Connected to Pomatez!",
            "You can close this tab."
          );
          finishConnect(null);
        })
        .catch((error) => {
          console.error("[GoogleCalendar] Code exchange failed", error);
          respond(
            res,
            200,
            "Not connected",
            "Something went wrong talking to Google. You can close this tab and try again from Pomatez."
          );
          finishConnect("network");
        });
    });

    await new Promise<void>((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const { port } = server.address() as AddressInfo;
    const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;

    const authUrl = new URL(config.authUrl);
    authUrl.search = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    }).toString();

    pending = {
      server,
      url: authUrl.toString(),
      timer: setTimeout(
        () => finishConnect("timeout"),
        connectTimeoutMs
      ),
    };
    lastError = null;
    emitStatus();
    await deps.openExternal(pending.url);
  };

  const cancel = () => finishConnect(null);

  const signOutForReauth = () => {
    deps.clearSecret();
    lastError = "reauth";
    emitStatus();
  };

  /** A valid access token, refreshed silently when close to expiry. */
  const getAccessToken = async (
    force = false
  ): Promise<Tokens | null> => {
    const tokens = readTokens();
    if (!tokens) return null;
    if (!force && tokens.expiresAt - now() > 60 * 1000) return tokens;
    const config = loadConfig();
    if (!config) return null;

    if (!refreshing) {
      refreshing = postForm(config.tokenUrl, {
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: config.clientId,
        ...(config.clientSecret && {
          client_secret: config.clientSecret,
        }),
      })
        .then((body) => {
          const next: Tokens = {
            ...tokens,
            accessToken: body.access_token,
            refreshToken: body.refresh_token || tokens.refreshToken,
            expiresAt: now() + (Number(body.expires_in) || 3600) * 1000,
          };
          writeTokens(next);
          return next;
        })
        .catch((error) => {
          if (isInvalidGrant(error)) {
            signOutForReauth();
            return null;
          }
          throw error;
        })
        .finally(() => {
          refreshing = null;
        });
    }
    return refreshing;
  };

  const requestEvents = async (
    config: Config,
    token: string,
    timeMin: string,
    timeMax: string
  ) => {
    const items: RawEvent[] = [];
    let summary: string | undefined;
    let pageToken: string | undefined;
    // Up to 4 pages of 250 for one week is plenty.
    for (let i = 0; i < 4; i++) {
      const url = new URL(`${config.apiBase}/calendars/primary/events`);
      url.search = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
        ...(pageToken && { pageToken }),
      }).toString();
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return { unauthorized: true as const };
      if (!res.ok)
        throw new Error(`Events request failed (${res.status})`);
      const body = (await res.json()) as {
        items?: RawEvent[];
        summary?: string;
        nextPageToken?: string;
      };
      summary = summary || body.summary;
      items.push(...(body.items || []));
      pageToken = body.nextPageToken;
      if (!pageToken) break;
    }
    return { items, summary };
  };

  /** Fetches events between two ISO instants and sends them under `key`. */
  const fetchRange = async (
    key: string,
    timeMin: string,
    timeMax: string
  ) => {
    const config = loadConfig();
    if (!config) return;
    try {
      let tokens = await getAccessToken();
      if (!tokens) return;
      let result = await requestEvents(
        config,
        tokens.accessToken,
        timeMin,
        timeMax
      );
      if ("unauthorized" in result) {
        tokens = await getAccessToken(true);
        if (!tokens) return;
        result = await requestEvents(
          config,
          tokens.accessToken,
          timeMin,
          timeMax
        );
        if ("unauthorized" in result) return signOutForReauth();
      }
      if (result.summary && result.summary !== tokens.email) {
        writeTokens({ ...tokens, email: result.summary });
      }
      if (lastError) {
        lastError = null;
      }
      emitStatus();
      deps.onEvents(
        key,
        result.items
          .map(normalizeEvent)
          .filter((e): e is CalendarEvent => !!e)
      );
    } catch (error) {
      console.error("[GoogleCalendar] Sync failed", error);
      lastError = "network";
      emitStatus();
    }
  };

  const disconnect = async () => {
    const tokens = readTokens();
    deps.clearSecret();
    lastError = null;
    emitStatus();
    const config = loadConfig();
    if (tokens && config) {
      // Best effort: the local copy is already gone either way.
      fetch(
        `${config.revokeUrl}?token=${encodeURIComponent(
          tokens.refreshToken
        )}`,
        {
          method: "POST",
        }
      ).catch((error) =>
        console.error("[GoogleCalendar] Revoke failed", error)
      );
    }
  };

  return {
    connect,
    cancel,
    disconnect,
    fetchRange,
    emitStatus,
    getAccessToken,
    /** For tests. */
    isPending: () => !!pending,
  };
};
