import { BrowserWindow, Display, Rectangle } from "electron";
import { WindowSurfaceState } from "@pomatez/shareables";
import { COMPACT_WIDTH } from "./compactSize";

type Source = "tray" | "notch" | "workspace";
const DASHBOARD = { width: 1200, height: 760 };
const MINIMUM = { width: 1100, height: 620 };

/** Keep window geometry in display coordinates, including negative origins. */
export function clampBounds(
  bounds: Rectangle,
  area: Rectangle
): Rectangle {
  const width = Math.min(bounds.width, area.width);
  const height = Math.min(bounds.height, area.height);
  return {
    width,
    height,
    x: Math.round(
      Math.max(area.x, Math.min(bounds.x, area.x + area.width - width))
    ),
    y: Math.round(
      Math.max(
        area.y,
        Math.min(bounds.y, area.y + area.height - height)
      )
    ),
  };
}

export function createWindowSurfaces(options: {
  window: () => BrowserWindow | null;
  screen: {
    getPrimaryDisplay: () => Display;
    getDisplayMatching: (bounds: Rectangle) => Display;
  };
  compactHeight: () => number;
  fullscreen: () => boolean;
  show: (window: BrowserWindow) => void;
  publish: (state: WindowSurfaceState) => void;
  layoutChanged: (layout: WindowSurfaceState["layout"]) => void;
  initialBounds?: Rectangle;
  saveBounds: (bounds: Rectangle) => void;
  initiallyHidden: boolean;
}) {
  let state: WindowSurfaceState = {
    layout: "dashboard",
    pinned: false,
    revision: 0,
  };
  let workspaceBounds = options.initialBounds;
  let workspaceMaximized = false;
  let pendingShow = !options.initiallyHidden;
  let rendererReady = false;
  let blurTimer: NodeJS.Timeout | undefined;
  let alwaysOnTop = false;
  let dialogDepth = 0;

  const cancelBlur = () => {
    if (blurTimer) clearTimeout(blurTimer);
    blurTimer = undefined;
  };
  const priority = () => {
    if (!options.fullscreen())
      options
        .window()
        ?.setAlwaysOnTop(alwaysOnTop || state.pinned, "floating");
  };
  const publish = () => options.publish({ ...state });
  const saveWorkspace = () => {
    const win = options.window();
    if (!win || state.layout !== "dashboard" || options.fullscreen())
      return;
    workspaceMaximized = win.isMaximized();
    workspaceBounds = workspaceMaximized
      ? win.getNormalBounds()
      : win.getBounds();
    options.saveBounds(workspaceBounds);
  };
  const dismiss = () => {
    if (
      state.layout !== "classic" ||
      options.fullscreen() ||
      dialogDepth
    )
      return;
    cancelBlur();
    pendingShow = false;
    state = { ...state, pinned: false, revision: state.revision + 1 };
    priority();
    options.window()?.hide();
    publish();
  };

  const open = (
    layout: WindowSurfaceState["layout"],
    source: Source = "workspace",
    anchor?: Rectangle
  ) => {
    const win = options.window();
    if (
      !win ||
      win.isDestroyed() ||
      options.fullscreen() ||
      win.isFullScreen()
    )
      return;
    cancelBlur();
    const previous = state.layout;
    if (previous === "dashboard" && layout === "classic")
      saveWorkspace();
    const display =
      source === "notch"
        ? options.screen.getPrimaryDisplay()
        : options.screen.getDisplayMatching(anchor || win.getBounds());
    if (layout !== previous) win.hide();
    if (win.isMinimized()) win.restore();
    if (win.isMaximized() && layout === "classic") win.unmaximize();
    state = {
      layout,
      pinned:
        previous === "classic" && layout === "classic"
          ? state.pinned
          : false,
      revision: state.revision + 1,
    };
    options.layoutChanged(layout);
    if (layout === "classic") {
      win.setMaximizable(false);
      // Lower the dashboard minimum before shrinking the window.
      win.setMinimumSize(
        COMPACT_WIDTH,
        Math.min(options.compactHeight(), display.workArea.height)
      );
      const bounds = {
        width: COMPACT_WIDTH,
        height: options.compactHeight(),
        x:
          anchor && source === "tray"
            ? anchor.x + (anchor.width - COMPACT_WIDTH) / 2
            : display.bounds.x +
              (display.bounds.width - COMPACT_WIDTH) / 2,
        y:
          source === "notch"
            ? Math.max(display.workArea.y, display.bounds.y + 84) + 8
            : (anchor ? anchor.y + anchor.height : display.workArea.y) +
              8,
      };
      win.setBounds(clampBounds(bounds, display.workArea));
      win.setResizable(false);
    } else if (previous !== layout || !rendererReady) {
      const target = workspaceBounds
        ? options.screen.getDisplayMatching(workspaceBounds)
        : display;
      win.setResizable(true);
      win.setMaximizable(true);
      win.setMinimumSize(
        Math.min(MINIMUM.width, target.workArea.width),
        Math.min(MINIMUM.height, target.workArea.height)
      );
      const restored = workspaceBounds || {
        ...DASHBOARD,
        x:
          target.workArea.x +
          (target.workArea.width - DASHBOARD.width) / 2,
        y:
          target.workArea.y +
          (target.workArea.height - DASHBOARD.height) / 2,
      };
      win.setBounds(
        clampBounds(
          {
            ...restored,
            width: Math.max(MINIMUM.width, restored.width),
            height: Math.max(MINIMUM.height, restored.height),
          },
          target.workArea
        )
      );
      if (workspaceMaximized) win.maximize();
    }
    priority();
    pendingShow = true;
    publish();
  };

  return {
    open,
    dismiss,
    saveWorkspace,
    windowRecreated() {
      const pinned = state.pinned;
      rendererReady = false;
      open(state.layout);
      if (pinned) {
        state = { ...state, pinned, revision: state.revision + 1 };
        priority();
        publish();
      }
    },
    getState: () => ({ ...state }),
    sync() {
      rendererReady = false;
      publish();
    },
    ready(revision: number) {
      if (revision !== state.revision) return;
      rendererReady = true;
      if (pendingShow) {
        pendingShow = false;
        const win = options.window();
        if (win) options.show(win);
      }
    },
    toggle(source: "tray" | "notch", anchor?: Rectangle) {
      const win = options.window();
      // A tray click can blur the HUD before Electron dispatches `click`.
      const blurredByClick = !!blurTimer;
      cancelBlur();
      if (
        state.layout === "classic" &&
        ((win?.isVisible() && win.isFocused()) || blurredByClick)
      ) {
        dismiss();
      } else open("classic", source, anchor);
    },
    blur() {
      const win = options.window();
      const devToolsOpen = !!win?.webContents?.isDevToolsOpened?.();
      if (
        state.layout !== "classic" ||
        pendingShow ||
        options.fullscreen() ||
        dialogDepth ||
        devToolsOpen
      )
        return;
      cancelBlur();
      blurTimer = setTimeout(() => {
        blurTimer = undefined;
        const currentWin = options.window();
        if (
          !state.pinned &&
          !currentWin?.isFocused() &&
          !currentWin?.webContents?.isDevToolsOpened?.()
        )
          dismiss();
      }, 150);
    },
    pin(pinned: boolean) {
      if (state.layout !== "classic" || options.fullscreen()) return;
      cancelBlur();
      state = { ...state, pinned, revision: state.revision + 1 };
      priority();
      publish();
    },
    setAlwaysOnTop(value: boolean) {
      alwaysOnTop = value;
      priority();
    },
    suspendDismissal() {
      dialogDepth++;
      cancelBlur();
      return () => {
        dialogDepth = Math.max(0, dialogDepth - 1);
      };
    },
    fullscreenChanged() {
      cancelBlur();
      pendingShow = false;
      priority();
    },
    displayChanged() {
      const win = options.window();
      if (
        !win ||
        win.isDestroyed() ||
        options.fullscreen() ||
        win.isFullScreen()
      )
        return;
      const bounds = win.getBounds();
      const { workArea } = options.screen.getDisplayMatching(bounds);
      win.setMinimumSize(
        Math.min(
          state.layout === "dashboard" ? MINIMUM.width : COMPACT_WIDTH,
          workArea.width
        ),
        Math.min(
          state.layout === "dashboard"
            ? MINIMUM.height
            : options.compactHeight(),
          workArea.height
        )
      );
      win.setBounds(clampBounds(bounds, workArea));
      saveWorkspace();
    },
    destroy() {
      cancelBlur();
    },
  };
}
