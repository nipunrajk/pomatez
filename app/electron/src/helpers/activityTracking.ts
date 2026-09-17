import {
  app,
  BrowserWindow,
  systemPreferences,
  dialog,
  shell,
} from "electron";
import activeWindow from "active-win";
import { ACTIVITY_SAMPLE } from "@pomatez/shareables";
import { isMacOS } from "./isMacOS";

const POLL_INTERVAL_SECONDS = 7;

const ACCESSIBILITY_SETTINGS_URL =
  "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility";

let intervalId: NodeJS.Timeout | null = null;

function hasAccessibilityPermission(prompt: boolean): boolean {
  if (!isMacOS()) return true;
  return systemPreferences.isTrustedAccessibilityClient(prompt);
}

function extractDomain(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (error) {
    return undefined;
  }
}

async function pollActiveWindow(win: BrowserWindow): Promise<void> {
  try {
    const result = await activeWindow({
      accessibilityPermission: true,
      screenRecordingPermission: false,
    });
    if (!result || win.isDestroyed()) return;

    const appName = result.owner.name;
    const domain =
      result.platform === "macos" && result.url
        ? extractDomain(result.url)
        : undefined;

    win.webContents.send(ACTIVITY_SAMPLE, {
      appName,
      domain,
      timestamp: Date.now(),
      sampleSeconds: POLL_INTERVAL_SECONDS,
    });
  } catch (error) {
    console.log("Activity tracking sample failed:", error);
  }
}

export function initializeActivityTracking(win: BrowserWindow): void {
  if (intervalId) return;

  // Triggers the system prompt the first time; later calls are a silent
  // check, since macOS only ever prompts once per app.
  if (!hasAccessibilityPermission(true)) {
    dialog
      .showMessageBox(win, {
        type: "info",
        title: "Accessibility permission needed",
        message:
          "Pomatez needs Accessibility permission to see which app and website you're using during focus sessions.",
        detail: `Enable ${
          app.isPackaged ? "Pomatez" : "Electron"
        } under Privacy & Security › Accessibility, then quit and reopen the app.`,
        buttons: ["Open System Settings", "Later"],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) {
          shell.openExternal(ACCESSIBILITY_SETTINGS_URL);
        }
      });
  }

  pollActiveWindow(win);
  intervalId = setInterval(
    () => pollActiveWindow(win),
    POLL_INTERVAL_SECONDS * 1000
  );
}

export function uninitializeActivityTracking(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
