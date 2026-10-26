import {
  AppLayout,
  NotificationTypes,
  SettingTypes,
  TrayIconStyle,
} from "./types";
import { detectOS } from "utils";

export const defaultSettings: Readonly<SettingTypes> = Object.freeze({
  alwaysOnTop: false,
  ignoreUpdate: "",
  enableFullscreenBreak: false,
  enableStrictMode: false,
  // Modula (light) is the default; dark stays opt-in.
  enableDarkTheme: false,
  followSystemTheme: false,
  modulaThemeMigrated: true,
  enableProgressAnimation: true,
  enableVoiceAssistance: false,
  notificationSoundOn: true,
  notificationType: NotificationTypes.NONE,
  closeToTray: true,
  minimizeToTray: false,
  showTimerInTrayBar: true,
  showNotchIsland: detectOS() === "MacOS",
  enableUsageTracking: false,
  autoStartWorkTime: false,
  useNativeTitlebar: detectOS() === "Windows" ? false : true,
  openAtLogin: false,
  enableRPC: true,
  language: "auto",
  trayIconStyle: TrayIconStyle.CLASSIC,
  layout: AppLayout.CLASSIC,
});
