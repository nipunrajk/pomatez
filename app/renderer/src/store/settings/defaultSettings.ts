import {
  AppLayout,
  NotificationTypes,
  SettingTypes,
  TrayIconStyle,
} from "./types";
import { detectOS, isPreferredDark } from "utils";

export const defaultSettings: Readonly<SettingTypes> = Object.freeze({
  alwaysOnTop: false,
  compactMode: false,
  ignoreUpdate: "",
  enableFullscreenBreak: false,
  enableStrictMode: false,
  enableDarkTheme: isPreferredDark(),
  followSystemTheme: true,
  enableProgressAnimation: true,
  enableVoiceAssistance: false,
  notificationSoundOn: true,
  notificationType: NotificationTypes.NONE,
  closeToTray: true,
  minimizeToTray: false,
  showTimerInTrayBar: false,
  enableUsageTracking: false,
  autoStartWorkTime: false,
  useNativeTitlebar: detectOS() === "Windows" ? false : true,
  openAtLogin: false,
  enableRPC: true,
  language: "auto",
  trayIconStyle: TrayIconStyle.CLASSIC,
  layout: AppLayout.CLASSIC,
});
