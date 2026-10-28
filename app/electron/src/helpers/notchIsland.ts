import { BrowserWindow, screen } from "electron";
import { NOTCH_ISLAND_STATE } from "@pomatez/shareables";

export type NotchIslandState = {
  enabled: boolean;
  playing: boolean;
  active: boolean;
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
  onVisibilityChange,
}: {
  preload: string;
  pageUrl: string;
  onClick: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}) {
  let win: BrowserWindow | null = null;
  let lastState: NotchIslandState | null = null;
  let hideTimer: NodeJS.Timeout | null = null;
  let pageReady = false;
  let reportedVisible = false;
  let destroyed = false;

  const isVisible = () =>
    Boolean(
      !destroyed &&
        lastState?.enabled &&
        lastState.active &&
        pageReady &&
        win &&
        !win.isDestroyed() &&
        win.isVisible() &&
        hasNotch(screen.getPrimaryDisplay())
    );
  const notifyVisibility = () => {
    const visible = isVisible();
    if (visible === reportedVisible) return;
    reportedVisible = visible;
    onVisibilityChange?.(visible);
  };

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
    const visible = lastState.enabled && lastState.active && notch;
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
      // This is a system-style overlay, not an app window to arrange in Mission Control.
      hiddenInMissionControl: true,
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
      notifyVisibility();
    });
    win.webContents.on("render-process-gone", () => {
      pageReady = false;
      notifyVisibility();
    });
    win.on("show", notifyVisibility);
    win.on("hide", notifyVisibility);
    win.on("closed", () => {
      win = null;
      pageReady = false;
      notifyVisibility();
    });
    win.loadURL(pageUrl);
    return win;
  };

  const onDisplayChange = () => {
    reconcile();
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

  const reconcile = () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    const visible =
      lastState?.enabled &&
      lastState.active &&
      hasNotch(screen.getPrimaryDisplay());
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
        notifyVisibility();
      }, HIDE_DELAY_MS);
    }
    notifyVisibility();
  };

  return {
    isVisible,
    update(state: NotchIslandState) {
      if (destroyed) return;
      lastState = state;
      // Listen even without an overlay so hotplugging a notched primary
      // display can reveal an already-running timer.
      listenToDisplays();
      reconcile();
    },

    setHovering(hovering: boolean) {
      win?.setIgnoreMouseEvents(!hovering, { forward: true });
    },

    owns: (sender: Electron.WebContents) => sender === win?.webContents,
    click: onClick,

    destroy() {
      destroyed = true;
      notifyVisibility();
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
