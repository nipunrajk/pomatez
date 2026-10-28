import {
  activateFullScreenShortcuts,
  deactivateFullScreenShortcuts,
} from "../helpers";
import { BrowserWindow, Menu, Tray } from "electron";

export type FullscreenState = {
  isFullscreen: boolean;
};

type FullscreenArgs = {
  shouldFullscreen: boolean;
  alwaysOnTop: boolean;
};

type AppArgs = {
  tray: Tray | null;
  trayTooltip: string;
  win: BrowserWindow | null;
  contextMenu: Menu;
  isFullscreen: FullscreenState["isFullscreen"];
  setTrayContextMenu?: (menu: Menu) => void;
};

const setFullScreen = (
  flag: boolean,
  alwaysOnTop: boolean,
  win: BrowserWindow | null
) => {
  if (flag) {
    win?.setResizable(true);
  }
  win?.setFullScreenable(true);
  win?.setAlwaysOnTop(alwaysOnTop, flag ? "screen-saver" : "floating");
  win?.setFullScreen(flag);
  win?.setVisibleOnAllWorkspaces(flag);
  if (flag) {
    win?.show();
    win?.focus();
  }
};

/**
 * Handles the event of the main app SET_FULLSCREEN_BREAK
 *
 * @param fullscreenArgs
 * @param appArgs
 */
export const setFullscreenBreakHandler = (
  fullscreenArgs: FullscreenArgs,
  appArgs: AppArgs
) => {
  const { shouldFullscreen, alwaysOnTop } = fullscreenArgs;
  const { tray, trayTooltip, win, contextMenu, isFullscreen } = appArgs;
  const setTrayMenu =
    appArgs.setTrayContextMenu ||
    ((menu: Menu) => tray?.setContextMenu(menu));

  if (!win || win.isDestroyed()) return isFullscreen;

  // Settings are sent on startup and whenever pinning changes. Only an
  // actual break transition should change Spaces, fullscreen, or focus.
  if (shouldFullscreen === isFullscreen) {
    win.setAlwaysOnTop(
      alwaysOnTop,
      isFullscreen ? "screen-saver" : "floating"
    );
    return isFullscreen;
  }

  if (shouldFullscreen) {
    setFullScreen(true, alwaysOnTop, win);

    activateFullScreenShortcuts(() => {});

    tray?.setToolTip("");
    setTrayMenu(
      Menu.buildFromTemplate([
        {
          label: "Please wait for your break to end.",
        },
      ])
    );
  } else {
    setFullScreen(false, alwaysOnTop, win);

    deactivateFullScreenShortcuts();
    tray?.setToolTip(trayTooltip);
    setTrayMenu(contextMenu);
  }
  return shouldFullscreen;
};
