import { PayloadAction } from "@reduxjs/toolkit";

export type SettingTypes = {
  ignoreUpdate: string;
  alwaysOnTop: boolean;
  enableFullscreenBreak: boolean;
  enableDarkTheme: boolean;
  followSystemTheme: boolean;
  enableStrictMode: boolean;
  enableProgressAnimation: boolean;
  enableVoiceAssistance: boolean;
  useNativeTitlebar: boolean;
  notificationSoundOn: boolean;
  closeToTray: boolean;
  minimizeToTray: boolean;
  showTimerInTrayBar: boolean;
  enableUsageTracking: boolean;
  autoStartWorkTime: boolean;
  notificationType: NotificationTypes;
  openAtLogin: boolean;
  enableRPC: boolean;
  language: LanguageOption;
  trayIconStyle: TrayIconStyle;
  layout: AppLayout;
};

export const enum AppLayout {
  CLASSIC = "classic",
  DASHBOARD = "dashboard",
}

export type LanguageCode = "en" | "es" | "zh" | "ja";

export type LanguageOption = "auto" | LanguageCode;

export const enum NotificationTypes {
  NONE = "none",
  NORMAL = "normal",
  EXTRA = "extra",
}

export const enum TrayIconStyle {
  CLASSIC = "classic",
  MINIMAL = "minimal",
  TEXT_ONLY = "text_only",
  ICON_TEXT = "icon_text",
}

export type SettingsPayload<T extends keyof SettingTypes> =
  PayloadAction<SettingTypes[T]>;
