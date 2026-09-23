import {
  BrowserWindow,
  app,
  ipcMain,
  globalShortcut,
  Menu,
  Tray,
  shell,
  nativeImage,
  dialog,
} from "electron";
import debounce from "lodash.debounce";
import notifier from "node-notifier";
import path from "path";
import {
  SET_ALWAYS_ON_TOP,
  SET_FULLSCREEN_BREAK,
  MINIMIZE_WINDOW,
  CLOSE_WINDOW,
  SET_UI_THEME,
  SET_NATIVE_TITLEBAR,
  SHOW_WINDOW,
  RELEASE_NOTES_LINK,
  TRAY_ICON_UPDATE,
  TRAY_TITLE_UPDATE,
  SET_COMPACT_MODE,
  SET_LAYOUT,
  SET_OPEN_AT_LOGIN,
  SET_ENABLE_RPC,
  SET_ENABLE_ACTIVITY_TRACKING,
} from "@pomatez/shareables";
import {
  activateGlobalShortcuts,
  activateAutoUpdate,
  blockShortcutKeys,
  getIcon,
  getTrayIcon,
  isWindow,
  isMacOS,
  getFromStorage,
  createContextMenu,
  initializeRPC,
  uninitializeRPC,
  isUserHaveSession,
  initializeActivityTracking,
  uninitializeActivityTracking,
} from "./helpers";
import isDev from "electron-is-dev";
import store, { AppLayoutName } from "./store";

import {
  FullscreenState,
  setFullscreenBreakHandler,
} from "./lifecycleEventHandlers/fullScreenBreak";
import WindowsToaster from "node-notifier/notifiers/toaster";
import NotificationCenter from "node-notifier/notifiers/notificationcenter";

const onProduction = app.isPackaged;

const notificationIcon = path.join(
  __dirname,
  "assets/notification-dark.png"
);

const trayIcon = getTrayIcon();

const onlySingleInstance = app.requestSingleInstanceLock();

const applicationMenu = isMacOS()
  ? Menu.buildFromTemplate([{ role: "appMenu" }, { role: "editMenu" }])
  : null;
Menu.setApplicationMenu(applicationMenu);

const getFrameHeight = () => {
  if (isWindow()) {
    return 502;
  } else {
    if (store.safeGet("useNativeTitlebar")) {
      return 488;
    }
    return 502;
  }
};

let tray: Tray | null = null;

let win: BrowserWindow | null;

let isRecreatingWindow = false;

type WindowStateProps = {
  isOnCompactMode: boolean;
  layout: AppLayoutName;
} & FullscreenState;

const windowState: WindowStateProps = {
  isFullscreen: false,
  isOnCompactMode: false,
  layout:
    store.safeGet("layout") === "dashboard" ? "dashboard" : "classic",
};

const DASHBOARD_SIZE = { width: 1200, height: 760 };
const DASHBOARD_MIN_SIZE = { width: 960, height: 620 };

const isDashboardLayout = () => windowState.layout === "dashboard";

function applyLayoutSize(window: BrowserWindow) {
  if (isDashboardLayout()) {
    window.setResizable(true);
    window.setMaximizable(true);
    window.setMinimumSize(
      DASHBOARD_MIN_SIZE.width,
      DASHBOARD_MIN_SIZE.height
    );
    window.setSize(DASHBOARD_SIZE.width, DASHBOARD_SIZE.height);
    window.center();
  } else {
    if (window.isMaximized()) window.unmaximize();
    window.setMaximizable(false);
    window.setMinimumSize(340, getFrameHeight());
    window.setSize(340, getFrameHeight());
  }
}

const workspaceOptions = { skipTransformProcessType: true };
let pendingWorkspaceReset: NodeJS.Timeout | null = null;

/**
 * Shows and focuses the window on the macOS Space the user is currently on,
 * instead of jumping them to the Space the window was last on.
 *
 * The window joins all Spaces, is shown, then leaves them again. It must
 * leave in a *later* turn: toggling within the same turn is a no-op for the
 * window server, so the window stays on its old Space and the app activation
 * from `show()` switches the user there. Measured on macOS 26, resets under
 * ~100ms are unreliable, hence 300ms (which also outlasts the async
 * activation). `skipTransformProcessType` stops Electron from hiding and
 * re-showing the Dock icon, which would re-activate the app later.
 */
function showOnCurrentWorkspace(window: BrowserWindow | null) {
  if (!window) return;

  // Already on all Spaces (fullscreen break, or a reset still pending).
  if (window.isVisibleOnAllWorkspaces()) {
    window.show();
    window.focus();
    return;
  }

  window.setVisibleOnAllWorkspaces(true, workspaceOptions);
  window.show();
  window.focus();

  pendingWorkspaceReset = setTimeout(() => {
    pendingWorkspaceReset = null;
    if (!window.isDestroyed()) {
      window.setVisibleOnAllWorkspaces(false, workspaceOptions);
    }
  }, 300);
}

function cancelPendingWorkspaceReset() {
  if (pendingWorkspaceReset) {
    clearTimeout(pendingWorkspaceReset);
    pendingWorkspaceReset = null;
  }
}

function createMainWindow() {
  const dashboard = isDashboardLayout();
  win = new BrowserWindow({
    width: dashboard ? DASHBOARD_SIZE.width : 340,
    height: dashboard ? DASHBOARD_SIZE.height : getFrameHeight(),
    ...(dashboard && {
      minWidth: DASHBOARD_MIN_SIZE.width,
      minHeight: DASHBOARD_MIN_SIZE.height,
    }),
    resizable: true,
    maximizable: dashboard,
    show: false,
    frame: store.safeGet("useNativeTitlebar"),
    icon: getIcon(),
    backgroundColor: store.safeGet("isDarkMode") ? "#141e25" : "#fff",
    webPreferences: {
      contextIsolation: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Open the DevTools.
  if (isDev) win.webContents.openDevTools({ mode: "detach" });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  win.loadURL(
    !onProduction
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "index.html")}`
  );

  win.once("ready-to-show", () => {
    win?.show();
  });

  win.on(
    "minimize",
    debounce(
      async () => {
        try {
          if (win) {
            const data = await getFromStorage(win, "state");
            if (data.settings.minimizeToTray) {
              if (!windowState.isFullscreen) {
                win?.hide();
                if (tray === null && data.settings.minimizeToTray) {
                  createSystemTray();
                }
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      },
      1000,
      { leading: true }
    )
  );
  /**
   * This only exists to counteract an issue with linux where leave-full-screen triggers every time this is called on linux (when exiting fullscreen)
   *
   * It may be fixed in a future version of linux.
   *
   * If you try to set the size smaller than the minimum allowed it will also cause issues here.
   *
   * @param width
   * @param height
   */
  function setSizeIfDiff(width: number, height: number) {
    // Just to stop an infinite loop in the case of a bug
    const minSize = win?.getMinimumSize();
    width = Math.max(width, minSize?.[0] || 0);
    height = Math.max(height, minSize?.[1] || 0);
    const size = win?.getSize();
    if (!size || size[0] !== width || size[1] !== height) {
      win?.setSize(width, height);
    }
  }

  win.on("leave-full-screen", () => {
    // The dashboard is freely resizable; macOS restores its previous size.
    if (isDashboardLayout()) return;
    if (windowState.isOnCompactMode) {
      setSizeIfDiff(340, 100);
      // Windows doesn't like trying to set it as not resizeable it along with everything else that's going on
      setTimeout(() => {
        win?.setResizable(false);
      });
    } else {
      setSizeIfDiff(340, getFrameHeight());
    }
  });

  win.on(
    "close",
    debounce(
      async (e) => {
        e.preventDefault();
        try {
          if (win) {
            const data = await getFromStorage(win, "state");
            if (!data.settings.closeToTray) {
              app.exit();
            } else {
              if (!windowState.isFullscreen) {
                win?.hide();
                if (tray === null && data.settings.closeToTray) {
                  createSystemTray();
                }
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      },
      1000,
      { leading: true }
    )
  );

  createContextMenu(win);
}

const trayTooltip = "Just click to restore.";

const contextMenu = Menu.buildFromTemplate([
  {
    label: "Restore the app",
    click: () => {
      showOnCurrentWorkspace(win);
    },
  },
  {
    label: "Quit",
    click: async () => {
      if (!win || !(await isUserHaveSession(win))) {
        app.exit();
        return;
      }

      const quitConfirmButtons = ["Yes, end session", "Cancel"];
      const enum QuitConfirm {
        YES,
        NO,
      }

      // https://www.electronjs.org/docs/latest/api/dialog#dialogshowmessageboxsyncwindow-options
      // First argument is optional; null will not throw
      const response = dialog.showMessageBoxSync(win!, {
        type: "question",
        title: "Confirm Exit",
        message: "Are you sure you want to end the session?",
        buttons: quitConfirmButtons,
        defaultId: QuitConfirm.NO, // Cancel as default (better UX)
        cancelId: QuitConfirm.NO, // Esc/Cancel = Cancel,
        icon: getIcon(),
      });

      if (response === QuitConfirm.YES) {
        app.exit();
      }
    },
  },
]);

function createSystemTray() {
  tray = new Tray(trayIcon);

  tray.setToolTip(trayTooltip);
  tray.setContextMenu(contextMenu);

  tray?.on("click", () => {
    // Visible-but-unfocused usually means it's on another Space or behind
    // other apps, so bring it here rather than hiding it.
    if (win?.isVisible() && win.isFocused()) {
      if (!win.isFullScreen()) {
        win.hide();
      }
    } else {
      showOnCurrentWorkspace(win);
    }
  });
}

type NotificationProps = {
  title: string;
  message: string;
  actions: string[];
  callback?: (err: Error | null, response: string) => void;
};

function notify(props: NotificationProps) {
  // This is because it can take different types depending on the initialised OS.
  // Just for some reason, whoever sorted the types out of this library only really considered JS rather than TS.
  const notification: WindowsToaster.Notification &
    NotificationCenter.Notification = {
    icon: notificationIcon,
    title: props.title,
    message: props.message,
    actions: props.actions,
    appID: "com.roldanjr.pomatez",
    sound: true,
    wait: true,
  };

  notifier.notify(notification, (err, response) => {
    if (props.callback) props.callback(err, response);
  });
}

if (!onlySingleInstance) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) {
        win.restore();
      } else {
        showOnCurrentWorkspace(win);
      }
    }
  });

  app.whenReady().then(async () => {
    if (isDev) {
      console.log("Installing devtools");
      const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];
      const installer = await import("electron-devtools-installer");
      console.log(installer);

      for (const tool of extensions) {
        try {
          //@ts-expect-error
          await installer.default(installer[tool], true);
        } catch (e) {
          console.log(e);
        }
      }
    }

    createMainWindow();
    try {
      if (win) {
        const data = await getFromStorage(win, "state");
        if (data.settings.enableRPC) {
          initializeRPC();
        }
      }
    } catch (error) {
      console.log(error);
    }

    if (onProduction) {
      if (win) {
        const blockKeys = [
          "CommandOrControl+R",
          "CommandOrControl+Shift+R",
          "CommandOrControl+Alt+Q",
          "F11",
        ];
        blockShortcutKeys(win, blockKeys);
      }
    }

    activateGlobalShortcuts([
      {
        key: "Alt+Shift+H",
        callback: () => {
          win?.hide();
        },
      },
      {
        key: "Alt+Shift+S",
        callback: () => {
          showOnCurrentWorkspace(win);
        },
      },
    ]);

    const autoUpdater = activateAutoUpdate({
      onUpdateAvailable: (info) => {
        notify({
          title: "NEW UPDATE IS AVAILABLE",
          message: `App version ${info.version} ready to be downloaded.`,
          actions: ["View Release Notes"],
          callback: (err, response) => {
            if (!err) {
              if (response === "view release notes") {
                shell.openExternal(RELEASE_NOTES_LINK);
              }
            }
          },
        });
      },
      onUpdateDownloaded: (info) => {
        notify({
          title: "READY TO BE INSTALLED",
          message: "Update has been successfully downloaded.",
          // Temporarily commented out due to an issue with snoretoast https://github.com/mikaelbr/node-notifier/issues/332
          actions: ["Quit and Install" /*, "Install it Later"*/],
          callback: (err, response) => {
            if (!err) {
              //if (response === "quit and install") {
              autoUpdater.quitAndInstall();
              //}
            }
          },
        });
      },
    });
  });
}

ipcMain.on(SET_ALWAYS_ON_TOP, (e, { alwaysOnTop }) => {
  win?.setAlwaysOnTop(alwaysOnTop);
});

ipcMain.on(SET_FULLSCREEN_BREAK, (e, args) => {
  // The break sets its own all-Spaces state; don't let a pending reset undo it.
  cancelPendingWorkspaceReset();
  setFullscreenBreakHandler(args, {
    win,
    tray,
    trayTooltip,
    contextMenu,
    isFullscreen: windowState.isFullscreen,
  });
});

ipcMain.on(SET_LAYOUT, (e, { layout }: { layout: AppLayoutName }) => {
  if (layout !== "classic" && layout !== "dashboard") return;
  // Also sent on every launch; only resize on an actual change so a
  // user-resized dashboard window keeps its size.
  if (layout === windowState.layout) return;
  windowState.layout = layout;
  store.safeSet("layout", layout);
  if (win && !win.isFullScreen()) applyLayoutSize(win);
});

ipcMain.on(SET_COMPACT_MODE, (e, args) => {
  // Compact mode doesn't exist in the dashboard; don't shrink it to 340px.
  if (isDashboardLayout()) {
    windowState.isOnCompactMode = false;
    return;
  }
  if (args.compactMode) {
    win?.setMinimumSize(340, 100);
    win?.setSize(340, 100);
    win?.setResizable(false);
    windowState.isOnCompactMode = true;
  } else {
    win?.setResizable(true);
    windowState.isOnCompactMode = false;
    win?.setMinimumSize(340, getFrameHeight());
    win?.setSize(340, getFrameHeight());
  }
});

ipcMain.on(SET_UI_THEME, (e, { isDarkMode }) => {
  store.safeSet("isDarkMode", isDarkMode);
});

ipcMain.on(SHOW_WINDOW, () => {
  showOnCurrentWorkspace(win);
});

ipcMain.on(MINIMIZE_WINDOW, (e, { minimizeToTray }) => {
  if (!minimizeToTray) {
    win?.minimize();
  } else {
    if (tray === null) {
      createSystemTray();
    }
    win?.hide();
  }
});

ipcMain.on(CLOSE_WINDOW, (e, { closeToTray }) => {
  if (!closeToTray) {
    app.exit();
  } else {
    if (tray === null) {
      createSystemTray();
    }
    win?.hide();
  }
});

ipcMain.on(SET_NATIVE_TITLEBAR, (e, { useNativeTitlebar }) => {
  if (store.safeGet("useNativeTitlebar") !== useNativeTitlebar) {
    store.safeSet("useNativeTitlebar", useNativeTitlebar);
    const bounds = win?.getBounds();
    setTimeout(() => {
      isRecreatingWindow = true;
      win?.destroy();
      win = null;
      createMainWindow();
      isRecreatingWindow = false;
      if (bounds) {
        // Set in createMainWindow but the ts compiler seems to see it as never
        (win as BrowserWindow | null)?.setBounds(bounds);
      }
      if (onProduction && win) {
        blockShortcutKeys(win, [
          "CommandOrControl+R",
          "CommandOrControl+Shift+R",
          "CommandOrControl+Alt+Q",
          "F11",
        ]);
      }
    }, 1000);
  }
});

ipcMain.on(
  TRAY_ICON_UPDATE,
  (
    e,
    {
      dataUrl,
      isTemplate,
    }: { dataUrl: string | null; isTemplate: boolean }
  ) => {
    if (!dataUrl) {
      // Text-only style: macOS can go fully icon-less and rely on the
      // title text; other platforms can't show a title, so the renderer
      // falls back to a non-null icon there (see useTrayIconUpdates).
      if (process.platform === "darwin") {
        tray?.setImage(nativeImage.createEmpty());
      }
      return;
    }

    const image = nativeImage.createFromDataURL(dataUrl);
    if (process.platform === "darwin" && isTemplate) {
      image.setTemplateImage(true);
    }
    tray?.setImage(image);
  }
);

ipcMain.on(TRAY_TITLE_UPDATE, (e, title) => {
  tray?.setTitle(title || "");
});

ipcMain.on(SET_ENABLE_ACTIVITY_TRACKING, (e, { enable }) => {
  if (enable) {
    if (win) initializeActivityTracking(win);
  } else {
    uninitializeActivityTracking();
  }
});

ipcMain.on(SET_OPEN_AT_LOGIN, (e, { openAtLogin }) => {
  const storeOpenAtLogin = store.safeGet("openAtLogin");

  if (storeOpenAtLogin !== openAtLogin) {
    store.safeSet("openAtLogin", openAtLogin);

    app.setLoginItemSettings({
      openAtLogin: openAtLogin,
      openAsHidden: openAtLogin,
    });
  }
});

ipcMain.on(SET_ENABLE_RPC, (e, { enableRPC }) => {
  const enableRPCAtLogin = store.safeGet("openAtLogin");

  if (enableRPCAtLogin !== enableRPC) {
    store.safeSet("openAtLogin", enableRPC);
    if (enableRPC) {
      initializeRPC();
    } else {
      uninitializeRPC();
    }
  }
});

app.on("window-all-closed", () => {
  if (!isRecreatingWindow && process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.setAppUserModelId("com.roldanjr.pomatez");
