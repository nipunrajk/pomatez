import React, { useCallback, useContext, useEffect } from "react";
import { ConnnectorContext } from "../ConnnectorContext";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { CounterContext } from "../CounterContext";
import {
  CHECK_FOR_UPDATES,
  SET_ALWAYS_ON_TOP,
  CLOSE_WINDOW,
  SET_CLOSE_TO_TRAY,
  SET_LAYOUT,
  SET_FULLSCREEN_BREAK,
  MINIMIZE_WINDOW,
  SET_NATIVE_TITLEBAR,
  SHOW_WINDOW,
  SET_UI_THEME,
  TRAY_ICON_UPDATE,
  TRAY_TITLE_UPDATE,
  UPDATE_AVAILABLE,
} from "@pomatez/shareables";
import {
  enable,
  disable,
  isEnabled,
} from "@tauri-apps/plugin-autostart";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
import { setUpdateBody, setUpdateVersion } from "../../store/update";
import { useTrayIconUpdates } from "hooks/useTrayIconUpdates";
import { TrayIconStyle } from "store/settings/types";
import { padNum } from "utils";

export const TauriInvokeConnector = {
  send: (event: string, ...payload: any) => {
    invoke(event.toLowerCase(), ...payload).catch((err) =>
      console.error(err)
    );
  },
};

export const TauriConnectorProvider: React.FC = ({ children }) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector((state) => state.settings);

  // Prevent webpage behavior (naitive apps shouldn't refresh with F5 or Ctrl+R)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey && event.code === "KeyR") ||
        event.code === "F5"
      ) {
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /**
   * Apparently you can just use _blank as the target though it definitely isn't working on windows.
   *
   * This is a workaround :)
   */
  useEffect(() => {
    function urlClickHandler(e: MouseEvent) {
      const target = e.target as HTMLAnchorElement;
      if (
        target &&
        target.tagName === "A" &&
        target.href.startsWith("http") &&
        target.target === "_blank"
      ) {
        e.preventDefault();
        open(target.href); // Use Tauri's shell module to open external links
      }
    }
    window.addEventListener("click", urlClickHandler);
    return () => {
      window.removeEventListener("click", urlClickHandler);
    };
  }, []);

  /**
   * Rust uses lowercase snake_case for function names, so we need to convert to lower case for the calls.
   * @param event
   * @param payload
   */
  const send = useCallback(async (event: string, ...payload: any) => {
    await invoke(event.toLowerCase(), ...payload);
  }, []);

  useEffect(() => {
    // The autostart-plugin fails when trying to disble if it is already disabled
    // https://github.com/tauri-apps/plugins-workspace/issues/24#issuecomment-1528958008
    isEnabled().then((enabled) => {
      if (settings.openAtLogin) {
        if (!enabled)
          enable()
            .then(() => {
              console.log("Enabled autostart");
            })
            .catch((err) => console.error(err));
      } else {
        if (enabled)
          disable()
            .then(() => {
              console.log("Disabled autostart");
            })
            .catch((err) => console.error(err));
      }
    });
  }, [settings.openAtLogin]);

  const timer = useAppSelector((state) => state.timer);

  const { count, shouldFullscreen } = useContext(CounterContext);

  const onMinimizeCallback = useCallback(() => {
    send(MINIMIZE_WINDOW, {
      minimizeToTray: settings.minimizeToTray,
    });
    console.log("Minimize callback");
  }, [send, settings.minimizeToTray]);

  const onExitCallback = useCallback(() => {
    send(CLOSE_WINDOW, {
      closeToTray: settings.closeToTray,
    });
  }, [send, settings.closeToTray]);

  /**
   * Not needed as tauri already opens these externally.
   */
  const openExternalCallback = useCallback(() => {}, []);

  useEffect(() => {
    if (!settings.enableFullscreenBreak) {
      send(SHOW_WINDOW);
    }
  }, [send, timer.timerType, settings.enableFullscreenBreak]);

  useEffect(() => {
    send(SET_ALWAYS_ON_TOP, {
      alwaysOnTop: settings.alwaysOnTop,
    });
  }, [send, settings.alwaysOnTop]);

  // Keeps the Rust side aware of closeToTray so the native window-close
  // button (which never goes through onExitCallback/CLOSE_WINDOW) can
  // decide whether to hide to tray instead of closing.
  useEffect(() => {
    send(SET_CLOSE_TO_TRAY, {
      closeToTray: settings.closeToTray,
    });
  }, [send, settings.closeToTray]);

  useEffect(() => {
    send(SET_FULLSCREEN_BREAK, {
      shouldFullscreen,
      alwaysOnTop: settings.alwaysOnTop,
    });
  }, [send, settings.alwaysOnTop, shouldFullscreen]);

  // Sent before compact mode so Rust knows the layout when it decides how
  // to size the window.
  useEffect(() => {
    send(SET_LAYOUT, { layout: settings.layout });
  }, [send, settings.layout]);

  useEffect(() => {
    send(SET_UI_THEME, {
      isDarkMode: settings.enableDarkTheme,
    });
  }, [send, settings.enableDarkTheme]);

  useEffect(() => {
    send(SET_NATIVE_TITLEBAR, {
      useNativeTitlebar: settings.useNativeTitlebar,
    });
  }, [send, settings.useNativeTitlebar]);

  useTrayIconUpdates(({ dataUrl, isTemplate }) => {
    send(TRAY_ICON_UPDATE, { dataUrl, isTemplate });
  });

  const isTextTrayStyle =
    settings.trayIconStyle === TrayIconStyle.TEXT_ONLY ||
    settings.trayIconStyle === TrayIconStyle.ICON_TEXT;

  useEffect(() => {
    if (
      (settings.showTimerInTrayBar || isTextTrayStyle) &&
      timer.playing
    ) {
      const minutes = Math.floor(count / 60);
      const seconds = count % 60;
      send(TRAY_TITLE_UPDATE, {
        title: `${minutes}:${padNum(seconds)}`,
      });
    } else {
      send(TRAY_TITLE_UPDATE, { title: "" });
    }
  }, [
    send,
    settings.showTimerInTrayBar,
    isTextTrayStyle,
    timer.playing,
    count,
  ]);

  // Workaround to make sure it only calls once on mount
  const checkUpdate = useCallback(() => {
    send(CHECK_FOR_UPDATES, {
      ignoreVersion: settings.ignoreUpdate || "",
    });
  }, [send, settings.ignoreUpdate]);

  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  useEffect(() => {
    const unlisten = listen<{ body: string; version: string }>(
      UPDATE_AVAILABLE,
      (updateInfo) => {
        console.log("Update Info", updateInfo.payload);
        dispatch(setUpdateVersion(updateInfo?.payload?.version));
        dispatch(setUpdateBody(updateInfo?.payload?.body));
      }
    );
    return () => {
      unlisten.then((f) => f());
    };
  }, [dispatch]);

  return (
    <ConnnectorContext.Provider
      value={{
        onMinimizeCallback,
        onExitCallback,
        openExternalCallback,
      }}
    >
      {children}
    </ConnnectorContext.Provider>
  );
};
