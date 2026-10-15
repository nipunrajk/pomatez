import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { ConnnectorContext } from "../ConnnectorContext";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { CounterContext } from "../CounterContext";
import {
  SET_ALWAYS_ON_TOP,
  CLOSE_WINDOW,
  SET_LAYOUT,
  SET_FULLSCREEN_BREAK,
  MINIMIZE_WINDOW,
  SET_NATIVE_TITLEBAR,
  SHOW_WINDOW,
  SET_UI_THEME,
  TRAY_ICON_UPDATE,
  TRAY_TITLE_UPDATE,
  NOTCH_ISLAND_UPDATE,
  SET_OPEN_AT_LOGIN,
  SET_RPC_ACTIVITY,
  SET_ENABLE_RPC,
  SET_ENABLE_ACTIVITY_TRACKING,
  ACTIVITY_SAMPLE,
  GOOGLE_CALENDAR_EVENTS,
  GOOGLE_CALENDAR_STATUS,
  GOOGLE_CALENDAR_STATUS_REQUEST,
  OBSIDIAN_STATUS,
  OBSIDIAN_STATUS_REQUEST,
  OBSIDIAN_EXPORT_RESULT,
} from "@pomatez/shareables";
import { InvokeConnector } from "../InvokeConnector";
import { useTrayIconUpdates } from "hooks/useTrayIconUpdates";
import { TimerStatus } from "store/timer/types";
import { TrayIconStyle } from "store/settings/types";
import { padNum } from "utils";
import {
  CalendarEvent,
  CalendarStatus,
  recordActivitySample,
  RecordActivitySamplePayload,
  setCalendarEvents,
  setCalendarStatus,
  setObsidianExportResult,
  setObsidianVault,
} from "store";

export const ElectronInvokeConnector: InvokeConnector = {
  send: (event: string, ...payload: any) => {
    const { electron } = window;

    electron.send(event, ...payload);
  },
};

export const ElectronConnectorProvider: React.FC = ({ children }) => {
  const { electron } = window;
  const dispatch = useAppDispatch();

  const { timer, config, settings } = useAppSelector((state) => ({
    timer: state.timer,
    config: state.config,
    settings: state.settings,
  }));

  const { count, duration, shouldFullscreen } =
    useContext(CounterContext);

  const onMinimizeCallback = useCallback(() => {
    electron.send(MINIMIZE_WINDOW, {
      minimizeToTray: settings.minimizeToTray,
    });
  }, [electron, settings.minimizeToTray]);

  const onExitCallback = useCallback(() => {
    electron.send(CLOSE_WINDOW, {
      closeToTray: settings.closeToTray,
    });
  }, [electron, settings.closeToTray]);

  const openExternalCallback = useCallback(() => {
    const links = document.querySelectorAll("a");

    Array.prototype.forEach.call(links, (link: HTMLAnchorElement) => {
      const url = link.getAttribute("href");
      if (url?.indexOf("http") === 0) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          electron.openExternal(url);
        });
      }
    });
  }, [electron]);

  useEffect(() => {
    if (!settings.enableFullscreenBreak) {
      electron.send(SHOW_WINDOW);
    }
  }, [electron, timer.timerType, settings.enableFullscreenBreak]);

  useEffect(() => {
    electron.send(SET_ALWAYS_ON_TOP, {
      alwaysOnTop: settings.alwaysOnTop,
    });
  }, [electron, settings.alwaysOnTop]);

  useEffect(() => {
    electron.send(SET_FULLSCREEN_BREAK, {
      shouldFullscreen,
      alwaysOnTop: settings.alwaysOnTop,
    });
  }, [electron, settings.alwaysOnTop, shouldFullscreen]);

  // Sent before compact mode so the main process knows the layout when it
  // decides how to size the window.
  useEffect(() => {
    electron.send(SET_LAYOUT, { layout: settings.layout });
  }, [electron, settings.layout]);

  useEffect(() => {
    electron.send(SET_UI_THEME, {
      isDarkMode: settings.enableDarkTheme,
    });
  }, [electron, settings.enableDarkTheme]);

  useEffect(() => {
    electron.send(SET_NATIVE_TITLEBAR, {
      useNativeTitlebar: settings.useNativeTitlebar,
    });
  }, [electron, settings.useNativeTitlebar]);

  useEffect(() => {
    electron.send(SET_OPEN_AT_LOGIN, {
      openAtLogin: settings.openAtLogin,
    });
  }, [electron, settings.openAtLogin]);

  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    let activity = "Idle";
    let timerstart;
    let timerend;

    if (timer.playing) {
      switch (timer.timerType) {
        case TimerStatus.STAY_FOCUS:
          activity = "Focus";
          break;
        case TimerStatus.SHORT_BREAK:
          activity = "Break";
          break;
        case TimerStatus.LONG_BREAK:
          activity = "Break";
          break;
        case TimerStatus.SPECIAL_BREAK:
          activity = "Break";
          break;
      }
      const startime = new Date(Date.now());
      startime.setSeconds(
        startime.getSeconds() - (duration - countRef.current)
      );
      timerstart = startime;

      const endtime = new Date(Date.now());
      endtime.setSeconds(endtime.getSeconds() + duration);
      timerend = endtime;
    }

    electron.send(SET_RPC_ACTIVITY, {
      type: activity,
      start: timerstart,
      end: timerend,
      round: timer.round,
      sessionRounds: config.sessionRounds,
    });
  }, [
    electron,
    duration,
    timer.playing,
    timer.round,
    timer.timerType,
    config.sessionRounds,
  ]);

  useEffect(() => {
    electron.send(SET_ENABLE_RPC, {
      enableRPC: settings.enableRPC,
    });
  }, [electron, settings.enableRPC]);

  useTrayIconUpdates(({ dataUrl, isTemplate }) => {
    electron.send(TRAY_ICON_UPDATE, { dataUrl, isTemplate });
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
      electron.send(TRAY_TITLE_UPDATE, `${minutes}:${padNum(seconds)}`);
    } else {
      electron.send(TRAY_TITLE_UPDATE, "");
    }
  }, [
    electron,
    settings.showTimerInTrayBar,
    isTextTrayStyle,
    timer.playing,
    count,
  ]);

  useEffect(() => {
    electron.send(NOTCH_ISLAND_UPDATE, {
      enabled: settings.showNotchIsland,
      playing: timer.playing,
      timerType: timer.timerType,
      time: `${Math.floor(count / 60)}:${padNum(count % 60)}`,
      progress: duration > 0 ? (duration - count) / duration : 0,
      round: timer.round,
      sessionRounds: config.sessionRounds,
    });
  }, [
    electron,
    settings.showNotchIsland,
    timer.playing,
    timer.timerType,
    timer.round,
    config.sessionRounds,
    count,
    duration,
  ]);

  useEffect(() => {
    const enable =
      settings.enableUsageTracking &&
      timer.playing &&
      timer.timerType === TimerStatus.STAY_FOCUS;

    electron.send(SET_ENABLE_ACTIVITY_TRACKING, { enable });
  }, [
    electron,
    settings.enableUsageTracking,
    timer.playing,
    timer.timerType,
  ]);

  useEffect(() => {
    electron.receive(
      ACTIVITY_SAMPLE,
      (sample: RecordActivitySamplePayload) => {
        dispatch(recordActivitySample(sample));
      }
    );
  }, [electron, dispatch]);

  useEffect(() => {
    electron.receive(
      GOOGLE_CALENDAR_STATUS,
      (status: CalendarStatus) => {
        dispatch(setCalendarStatus(status));
      }
    );
    electron.receive(
      GOOGLE_CALENDAR_EVENTS,
      (payload: { key: string; events: CalendarEvent[] }) => {
        dispatch(setCalendarEvents(payload));
      }
    );
    electron.send(GOOGLE_CALENDAR_STATUS_REQUEST);
  }, [electron, dispatch]);

  useEffect(() => {
    electron.receive(
      OBSIDIAN_STATUS,
      (status: { vaultPath: string | null; isVault: boolean }) => {
        dispatch(setObsidianVault(status));
      }
    );
    electron.receive(
      OBSIDIAN_EXPORT_RESULT,
      (
        result:
          | { ok: true; written: number; removed: number }
          | { ok: false; error: string }
      ) => {
        dispatch(setObsidianExportResult({ ...result, at: Date.now() }));
      }
    );
    electron.send(OBSIDIAN_STATUS_REQUEST);
  }, [electron, dispatch]);

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
