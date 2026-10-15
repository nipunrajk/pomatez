/**
 * Pomatez backup file: the persisted app state wrapped with a small header,
 * so it can be recognised, versioned and moved between machines. Future
 * integrations (Obsidian, Notion) can build on `BackupData` too.
 */
export const BACKUP_APP = "pomatez";
export const BACKUP_FORMAT = 1;

/** The slices saved to storage under "state" (see store/store.ts). */
export const BACKUP_KEYS = [
  "config",
  "settings",
  "tasks",
  "history",
  "entries",
  "board",
  "integrations",
] as const;

export type BackupData = Partial<
  Record<(typeof BACKUP_KEYS)[number], unknown>
>;

export type BackupFile = {
  app: typeof BACKUP_APP;
  format: number;
  exportedAt: string;
  appVersion?: string;
  data: BackupData;
};

export type BackupError =
  | "invalidJson"
  | "notPomatez"
  | "newerFormat"
  | "badData";

export type ParsedBackup =
  | { ok: true; backup: BackupFile }
  | { ok: false; error: BackupError };

export const buildBackup = (
  data: BackupData,
  appVersion?: string
): BackupFile => ({
  app: BACKUP_APP,
  format: BACKUP_FORMAT,
  exportedAt: new Date().toISOString(),
  appVersion,
  data,
});

/** `pomatez-backup-2026-09-26.json`, in local time. */
export const backupFileName = (date = new Date()) => {
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `pomatez-backup-${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}.json`;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Checks the shapes the stores rely on when they load the state. */
const validData = (data: unknown): data is BackupData => {
  if (!isObject(data)) return false;
  if (!BACKUP_KEYS.some((key) => key in data)) return false;
  if ("tasks" in data && !Array.isArray(data.tasks)) return false;
  if (
    "entries" in data &&
    !(isObject(data.entries) && Array.isArray(data.entries.items))
  )
    return false;
  if ("board" in data) {
    const board = data.board;
    if (!isObject(board) || !isObject(board.columns)) return false;
    const columns = board.columns;
    if (
      !["pending", "ongoing", "completed"].every((c) =>
        Array.isArray(columns[c])
      )
    )
      return false;
  }
  for (const key of [
    "config",
    "settings",
    "history",
    "integrations",
  ] as const) {
    if (key in data && !isObject(data[key])) return false;
  }
  return true;
};

export const parseBackup = (text: string): ParsedBackup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "invalidJson" };
  }
  if (!isObject(parsed) || parsed.app !== BACKUP_APP) {
    return { ok: false, error: "notPomatez" };
  }
  if (typeof parsed.format !== "number" || parsed.format > BACKUP_FORMAT) {
    return { ok: false, error: "newerFormat" };
  }
  if (!validData(parsed.data)) return { ok: false, error: "badData" };

  // Only the known slices are restored; anything else is ignored.
  const data: BackupData = {};
  for (const key of BACKUP_KEYS) {
    if (key in parsed.data) data[key] = parsed.data[key];
  }
  return { ok: true, backup: { ...(parsed as BackupFile), data } };
};
