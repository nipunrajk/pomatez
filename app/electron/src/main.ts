import {
  BrowserWindow,
  screen,
  app,
  ipcMain,
  globalShortcut,
  Menu,
  Tray,
  shell,
  nativeImage,
  dialog,
  safeStorage,
} from "electron";
import debounce from "lodash.debounce";
import path from "path";
import {
  SET_ALWAYS_ON_TOP,
  SET_FULLSCREEN_BREAK,
  MINIMIZE_WINDOW,
  CLOSE_WINDOW,
  SET_UI_THEME,
  SET_NATIVE_TITLEBAR,
  SHOW_WINDOW,
  TRAY_ICON_UPDATE,
  TRAY_TITLE_UPDATE,
  SET_LAYOUT,
  WINDOW_SURFACE_REQUEST,
  WINDOW_SURFACE_STATE,
  WINDOW_SURFACE_READY,
  HUD_PIN_SET,
  HUD_DISMISS,
  SET_OPEN_AT_LOGIN,
  SET_ENABLE_RPC,
  SET_ENABLE_ACTIVITY_TRACKING,
  GOOGLE_CALENDAR_CONNECT,
  GOOGLE_CALENDAR_CANCEL,
  GOOGLE_CALENDAR_DISCONNECT,
  GOOGLE_CALENDAR_FETCH,
  GOOGLE_CALENDAR_STATUS_REQUEST,
  GOOGLE_CALENDAR_STATUS,
  GOOGLE_CALENDAR_EVENTS,
  OBSIDIAN_STATUS_REQUEST,
  OBSIDIAN_PICK_VAULT,
  OBSIDIAN_FORGET_VAULT,
  OBSIDIAN_EXPORT,
  OBSIDIAN_STATUS,
  OBSIDIAN_EXPORT_RESULT,
  NOTCH_ISLAND_UPDATE,
  NOTCH_ISLAND_CLICK,
  NOTCH_ISLAND_HOVER,
} from "@pomatez/shareables";
import {
  activateGlobalShortcuts,
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
  createNotchIsland,
  NotchIslandState,
} from "./helpers";
import isDev from "electron-is-dev";
import store, { AppLayoutName } from "./store";
import { COMPACT_WIDTH, getCompactHeight } from "./helpers/compactSize";
import {
  clampBounds,
  createWindowSurfaces,
} from "./helpers/windowSurfaces";

import {
  FullscreenState,
  setFullscreenBreakHandler,
} from "./lifecycleEventHandlers/fullScreenBreak";
import { createGoogleCalendar } from "./helpers/googleCalendar";
import { isObsidianVault, writeNotes } from "./helpers/obsidianVault";

const onProduction = app.isPackaged;

const trayIcon = getTrayIcon();

const onlySingleInstance = app.requestSingleInstanceLock();

const applicationMenu = isMacOS()
  ? Menu.buildFromTemplate([{ role: "appMenu" }, { role: "editMenu" }])
  : null;
Menu.setApplicationMenu(applicationMenu);

const getFrameHeight = getCompactHeight;

let tray: Tray | null = null;

let win: BrowserWindow | null;

let isRecreatingWindow = false;
let mainWindowCreated = false;

type WindowStateProps = {
  layout: AppLayoutName;
} & FullscreenState;

const windowState: WindowStateProps = {
  isFullscreen: false,
  layout:
    isMacOS() || store.safeGet("layout") === "dashboard"
      ? "dashboard"
      : "classic",
};

const DASHBOARD_SIZE = { width: 1200, height: 760 };
// layout.dashboard.minWidth in modula-theme.json.
const DASHBOARD_MIN_SIZE = { width: 1100, height: 620 };

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
    window.setResizable(false);
    window.setMinimumSize(COMPACT_WIDTH, getFrameHeight());
    window.setSize(COMPACT_WIDTH, getFrameHeight());
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

const surfaces = isMacOS()
  ? createWindowSurfaces({
      window: () => win,
      screen,
      compactHeight: getFrameHeight,
      fullscreen: () => windowState.isFullscreen,
      show: showOnCurrentWorkspace,
      publish: (state) =>
        win?.webContents.send(WINDOW_SURFACE_STATE, state),
      layoutChanged: (layout) => {
        windowState.layout = layout;
      },
      initialBounds: store.safeGet("workspaceBounds"),
      saveBounds: (bounds) => store.safeSet("workspaceBounds", bounds),
      initiallyHidden: app.getLoginItemSettings().wasOpenedAtLogin,
    })
  : null;

function onSurfaceDisplayChange() {
  surfaces?.displayChanged();
}

function hideMainWindow() {
  if (surfaces && windowState.isFullscreen) return;
  if (surfaces?.getState().layout === "classic") surfaces.dismiss();
  else win?.hide();
}

function openWorkspace() {
  if (!win || win.isDestroyed()) createMainWindow();
  if (surfaces) surfaces.open("dashboard");
  else showOnCurrentWorkspace(win);
}

function cancelPendingWorkspaceReset() {
  if (pendingWorkspaceReset) {
    clearTimeout(pendingWorkspaceReset);
    pendingWorkspaceReset = null;
  }
}

function createMainWindow() {
  mainWindowCreated = true;
  const dashboard = isDashboardLayout();
  win = new BrowserWindow({
    width: dashboard ? DASHBOARD_SIZE.width : COMPACT_WIDTH,
    height: dashboard ? DASHBOARD_SIZE.height : getFrameHeight(),
    ...(dashboard && {
      minWidth: DASHBOARD_MIN_SIZE.width,
      minHeight: DASHBOARD_MIN_SIZE.height,
    }),
    resizable: dashboard,
    maximizable: dashboard,
    show: false,
    frame: store.safeGet("useNativeTitlebar"),
    icon: getIcon(),
    // Painted before the renderer loads: Modula window cream, or dark.
    backgroundColor: store.safeGet("isDarkMode")
      ? "#141e25"
      : "#F5F5E7",
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

  const savedBounds = store.safeGet("workspaceBounds");
  if (surfaces && dashboard) {
    const area = screen.getDisplayMatching(
      savedBounds || win.getBounds()
    ).workArea;
    win.setMinimumSize(
      Math.min(DASHBOARD_MIN_SIZE.width, area.width),
      Math.min(DASHBOARD_MIN_SIZE.height, area.height)
    );
    const bounds = savedBounds || win.getBounds();
    win.setBounds(
      clampBounds(
        {
          ...bounds,
          width: Math.max(DASHBOARD_MIN_SIZE.width, bounds.width),
          height: Math.max(DASHBOARD_MIN_SIZE.height, bounds.height),
        },
        area
      )
    );
  }

  win.once("ready-to-show", () => {
    if (!surfaces) win?.show();
  });
  win.on("blur", () => surfaces?.blur());
  const persistWorkspaceBounds = debounce(
    () => surfaces?.saveWorkspace(),
    150
  );
  win.on("resize", persistWorkspaceBounds);
  win.on("move", persistWorkspaceBounds);
  win.once("closed", () => persistWorkspaceBounds.cancel());

  win.on(
    "minimize",
    debounce(
      async () => {
        try {
          if (win) {
            const data = await getFromStorage(win, "state");
            if (data.settings.minimizeToTray) {
              if (!windowState.isFullscreen) {
                hideMainWindow();
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
    setSizeIfDiff(COMPACT_WIDTH, getFrameHeight());
    if (surfaces) win?.setResizable(false);
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
                hideMainWindow();
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

const trayTooltip = isMacOS()
  ? "Click to toggle Compact HUD"
  : "Just click to restore.";

const contextMenu = Menu.buildFromTemplate([
  {
    label: isMacOS() ? "Open Workspace" : "Restore the app",
    click: openWorkspace,
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
      const resumeDismissal = surfaces?.suspendDismissal();
      const response = dialog.showMessageBoxSync(win!, {
        type: "question",
        title: "Confirm Exit",
        message: "Are you sure you want to end the session?",
        buttons: quitConfirmButtons,
        defaultId: QuitConfirm.NO, // Cancel as default (better UX)
        cancelId: QuitConfirm.NO, // Esc/Cancel = Cancel,
        icon: getIcon(),
      });

      resumeDismissal?.();
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

  tray?.on("click", (_event, bounds) => {
    if (surfaces) {
      surfaces.toggle("tray", bounds);
      return;
    }
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

if (!onlySingleInstance) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (surfaces) {
      openWorkspace();
    } else if (win) {
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
    if (surfaces && tray === null) createSystemTray();
    screen.on("display-metrics-changed", onSurfaceDisplayChange);
    screen.on("display-removed", onSurfaceDisplayChange);
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
          hideMainWindow();
        },
      },
      {
        key: "Alt+Shift+S",
        callback: () => {
          if (surfaces) openWorkspace();
          else showOnCurrentWorkspace(win);
        },
      },
    ]);
  });
}

ipcMain.on(SET_ALWAYS_ON_TOP, (e, { alwaysOnTop }) => {
  if (surfaces) surfaces.setAlwaysOnTop(!!alwaysOnTop);
  else win?.setAlwaysOnTop(alwaysOnTop);
});

ipcMain.on(SET_FULLSCREEN_BREAK, (e, args) => {
  // The break sets its own all-Spaces state; don't let a pending reset undo it.
  if (args.shouldFullscreen !== windowState.isFullscreen) {
    cancelPendingWorkspaceReset();
  }
  const fullscreenChanged =
    args.shouldFullscreen !== windowState.isFullscreen;
  windowState.isFullscreen = setFullscreenBreakHandler(args, {
    win,
    tray,
    trayTooltip,
    contextMenu,
    isFullscreen: windowState.isFullscreen,
  });
  if (fullscreenChanged) surfaces?.fullscreenChanged();
  surfaces?.setAlwaysOnTop(!!args.alwaysOnTop);
});

ipcMain.on(SET_LAYOUT, (e, { layout }: { layout: AppLayoutName }) => {
  if (
    e.sender !== win?.webContents ||
    (layout !== "classic" && layout !== "dashboard")
  )
    return;
  if (surfaces) {
    surfaces.open(layout);
    return;
  }
  // Also sent on every launch; only resize on an actual change so a
  // user-resized dashboard window keeps its size.
  if (layout === windowState.layout) return;
  windowState.layout = layout;
  store.safeSet("layout", layout);
  if (win && !win.isFullScreen()) applyLayoutSize(win);
});

ipcMain.on(SET_UI_THEME, (e, { isDarkMode }) => {
  store.safeSet("isDarkMode", isDarkMode);
});

ipcMain.on(SHOW_WINDOW, () => {
  if (surfaces) openWorkspace();
  else showOnCurrentWorkspace(win);
});

ipcMain.on(WINDOW_SURFACE_REQUEST, (event) => {
  if (event.sender === win?.webContents) surfaces?.sync();
});
ipcMain.on(WINDOW_SURFACE_READY, (event, revision) => {
  if (event.sender === win?.webContents) surfaces?.ready(revision);
});
ipcMain.on(HUD_PIN_SET, (event, pinned) => {
  if (event.sender === win?.webContents && typeof pinned === "boolean")
    surfaces?.pin(pinned);
});
ipcMain.on(HUD_DISMISS, (event) => {
  if (event.sender === win?.webContents) surfaces?.dismiss();
});

ipcMain.on(MINIMIZE_WINDOW, (e, { minimizeToTray }) => {
  if (!minimizeToTray) {
    win?.minimize();
  } else {
    if (tray === null) {
      createSystemTray();
    }
    hideMainWindow();
  }
});

ipcMain.on(CLOSE_WINDOW, (e, { closeToTray }) => {
  if (!closeToTray) {
    app.exit();
  } else {
    if (tray === null) {
      createSystemTray();
    }
    hideMainWindow();
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
      surfaces?.windowRecreated();
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

// Dynamic Island timer around the notch (macOS only). The renderer pushes
// timer state; the overlay window shows/hides itself from it.
const notchIsland =
  process.platform === "darwin"
    ? createNotchIsland({
        preload: path.join(__dirname, "preload.js"),
        pageUrl: `file://${path.join(
          __dirname,
          "assets",
          "notchIsland.html"
        )}`,
        onClick: () =>
          surfaces
            ? surfaces.toggle("notch")
            : showOnCurrentWorkspace(win),
      })
    : null;

ipcMain.on(NOTCH_ISLAND_UPDATE, (e, state: NotchIslandState) => {
  if (e.sender !== win?.webContents || !state) return;
  notchIsland?.update(state);
});

ipcMain.on(NOTCH_ISLAND_HOVER, (e, hovering: boolean) => {
  if (notchIsland?.owns(e.sender)) notchIsland.setHovering(!!hovering);
});

ipcMain.on(NOTCH_ISLAND_CLICK, (e) => {
  if (notchIsland?.owns(e.sender)) notchIsland.click();
});

ipcMain.on(TRAY_TITLE_UPDATE, (e, title) => {
  tray?.setTitle(title || "");
});

const GOOGLE_OAUTH_FILE = "google-oauth.json";

const googleCalendar = createGoogleCalendar({
  configPaths: () => [
    path.join(app.getPath("userData"), GOOGLE_OAUTH_FILE),
    onProduction
      ? path.join(process.resourcesPath, GOOGLE_OAUTH_FILE)
      : path.join(app.getAppPath(), GOOGLE_OAUTH_FILE),
  ],
  openExternal: (url) => shell.openExternal(url),
  encryptionAvailable: () => safeStorage.isEncryptionAvailable(),
  encrypt: (plain) =>
    safeStorage.encryptString(plain).toString("base64"),
  decrypt: (cipher) =>
    safeStorage.decryptString(Buffer.from(cipher, "base64")),
  readSecret: () => store.safeGet("googleCalendar"),
  writeSecret: (cipher) => store.safeSet("googleCalendar", cipher),
  clearSecret: () => store.safeDelete("googleCalendar"),
  onStatus: (status) =>
    win?.webContents.send(GOOGLE_CALENDAR_STATUS, status),
  onEvents: (key, events) =>
    win?.webContents.send(GOOGLE_CALENDAR_EVENTS, { key, events }),
});

ipcMain.on(GOOGLE_CALENDAR_STATUS_REQUEST, () => {
  googleCalendar.emitStatus();
});

ipcMain.on(GOOGLE_CALENDAR_CONNECT, () => {
  googleCalendar.connect().catch((error) => {
    console.error("[GoogleCalendar] Connect failed", error);
  });
});

ipcMain.on(GOOGLE_CALENDAR_CANCEL, () => {
  googleCalendar.cancel();
});

ipcMain.on(GOOGLE_CALENDAR_DISCONNECT, () => {
  googleCalendar.disconnect();
});

ipcMain.on(
  GOOGLE_CALENDAR_FETCH,
  (e, { key, timeMin, timeMax }: Record<string, unknown>) => {
    if (
      typeof key !== "string" ||
      typeof timeMin !== "string" ||
      typeof timeMax !== "string"
    ) {
      return;
    }
    googleCalendar.fetchRange(key, timeMin, timeMax);
  }
);

// Obsidian export (one way). The renderer builds the notes; main keeps the
// vault path (picked with the native dialog) and only writes inside it.
const sendObsidianStatus = () => {
  const vaultPath = store.safeGet("obsidianVault") || null;
  win?.webContents.send(OBSIDIAN_STATUS, {
    vaultPath,
    isVault: vaultPath ? isObsidianVault(vaultPath) : false,
  });
};

ipcMain.on(OBSIDIAN_STATUS_REQUEST, sendObsidianStatus);

ipcMain.on(OBSIDIAN_PICK_VAULT, async () => {
  if (!win) return;
  const resumeDismissal = surfaces?.suspendDismissal();
  const { canceled, filePaths } = await dialog
    .showOpenDialog(win, {
      title: "Choose your Obsidian vault",
      buttonLabel: "Use this vault",
      defaultPath: store.safeGet("obsidianVault"),
      properties: ["openDirectory", "createDirectory"],
    })
    .finally(() => resumeDismissal?.());
  if (!canceled && filePaths[0]) {
    store.safeSet("obsidianVault", filePaths[0]);
  }
  sendObsidianStatus();
});

ipcMain.on(OBSIDIAN_FORGET_VAULT, () => {
  store.safeDelete("obsidianVault");
  sendObsidianStatus();
});

ipcMain.on(
  OBSIDIAN_EXPORT,
  (e, { folder, files }: Record<string, unknown> = {}) => {
    const result = writeNotes(
      store.safeGet("obsidianVault"),
      folder,
      files
    );
    win?.webContents.send(OBSIDIAN_EXPORT_RESULT, result);
  }
);

ipcMain.on(SET_ENABLE_ACTIVITY_TRACKING, (e, { enable }) => {
  if (enable) {
    if (win)
      initializeActivityTracking(win, () =>
        surfaces?.suspendDismissal()
      );
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
  store.safeSet("enableRPC", enableRPC);
  if (enableRPC) {
    initializeRPC();
  } else {
    uninitializeRPC();
  }
});

app.on("window-all-closed", () => {
  if (!isRecreatingWindow && process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (!mainWindowCreated) return;
  if (surfaces) openWorkspace();
  else if (!win || win.isDestroyed()) createMainWindow();
});

app.on("will-quit", () => {
  screen.removeListener(
    "display-metrics-changed",
    onSurfaceDisplayChange
  );
  screen.removeListener("display-removed", onSurfaceDisplayChange);
  surfaces?.destroy();
  notchIsland?.destroy();
  globalShortcut.unregisterAll();
});

app.setAppUserModelId("com.nipunrajk.pomatez");
