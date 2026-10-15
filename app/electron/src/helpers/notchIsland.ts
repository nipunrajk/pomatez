import { BrowserWindow, screen } from "electron";
import { NOTCH_ISLAND_STATE } from "@pomatez/shareables";

export type NotchIslandState = {
  enabled: boolean;
  playing: boolean;
  timerType: string;
  time: string;
  progress: number;
  round: number;
  sessionRounds: number;
};

const WINDOW_SIZE = { width: 460, height: 130 };
// Matches the physical notch on 14"/16" MacBook Pros (~185-190pt).
const NOTCH_WIDTH = 190;
// Longer than the CSS collapse transition, so the window hides after it.
const HIDE_DELAY_MS = 450;

/**
 * Menu bars are taller on notched displays (~37pt vs ~24pt), and the
 * work area starts below it. Auto-hidden menu bars read as "no notch".
 */
const hasNotch = (display: Electron.Display) =>
  process.platform === "darwin" &&
  display.workArea.y - display.bounds.y > 30;

/**
 * A transparent, click-through overlay pinned to the top-center of the
 * primary display that the page inside morphs into a Dynamic Island around
 * the notch. Only the visible pill takes mouse input (the page toggles it
 * through `setHovering`).
 */
export function createNotchIsland({
  preload,
  pageUrl,
  onClick,
}: {
  preload: string;
  pageUrl: string;
  onClick: () => void;
}) {
  let win: BrowserWindow | null = null;
  let lastState: NotchIslandState | null = null;
  let hideTimer: NodeJS.Timeout | null = null;
  let pageReady = false;

  const place = () => {
    if (!win || win.isDestroyed()) return;
    const { bounds } = screen.getPrimaryDisplay();
    win.setBounds({
      x: Math.round(bounds.x + (bounds.width - WINDOW_SIZE.width) / 2),
      y: bounds.y,
      ...WINDOW_SIZE,
    });
  };

  const push = () => {
    if (!win || win.isDestroyed() || !pageReady || !lastState) return;
    const notch = hasNotch(screen.getPrimaryDisplay());
    const visible = lastState.enabled && lastState.playing;
    win.webContents.send(NOTCH_ISLAND_STATE, {
      ...lastState,
      visible,
      notchWidth: notch ? NOTCH_WIDTH : 0,
    });
  };

  const ensureWindow = () => {
    if (win && !win.isDestroyed()) return win;

    listenToDisplays();
    pageReady = false;
    win = new BrowserWindow({
      ...WINDOW_SIZE,
      type: process.platform === "darwin" ? "panel" : undefined,
      transparent: true,
      frame: false,
      hasShadow: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      focusable: false,
      // Without this macOS pushes the window below the menu bar instead of
      // letting it cover the notch.
      enableLargerThanScreen: true,
      show: false,
      backgroundColor: "#00000000",
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: false,
        preload,
      },
    });

    // Above the menu bar and over full-screen apps.
    win.setAlwaysOnTop(true, "screen-saver");
    win.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
      skipTransformProcessType: true,
    });
    win.setIgnoreMouseEvents(true, { forward: true });
    place();

    win.webContents.once("did-finish-load", () => {
      pageReady = true;
      push();
    });
    win.on("closed", () => {
      win = null;
      pageReady = false;
    });
    win.loadURL(pageUrl);
    return win;
  };

  const onDisplayChange = () => {
    place();
    push();
  };
  let listening = false;
  // `screen` can't be touched before the app is ready, so subscribe lazily.
  const listenToDisplays = () => {
    if (listening) return;
    listening = true;
    screen.on("display-metrics-changed", onDisplayChange);
    screen.on("display-added", onDisplayChange);
    screen.on("display-removed", onDisplayChange);
  };

  return {
    update(state: NotchIslandState) {
      lastState = state;
      const visible = state.enabled && state.playing;

      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }

      if (visible) {
        const w = ensureWindow();
        place();
        if (!w.isVisible()) w.showInactive();
        push();
      } else if (win && !win.isDestroyed()) {
        push();
        hideTimer = setTimeout(() => {
          hideTimer = null;
          if (win && !win.isDestroyed()) win.hide();
        }, HIDE_DELAY_MS);
      }
    },

    setHovering(hovering: boolean) {
      win?.setIgnoreMouseEvents(!hovering, { forward: true });
    },

    click: onClick,

    destroy() {
      if (listening) {
        screen.off("display-metrics-changed", onDisplayChange);
        screen.off("display-added", onDisplayChange);
        screen.off("display-removed", onDisplayChange);
      }
      if (hideTimer) clearTimeout(hideTimer);
      if (win && !win.isDestroyed()) win.destroy();
      win = null;
    },
  };
}
