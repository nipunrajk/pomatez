import React from "react";
import { TrayIconStyle } from "store/settings/types";
import { TrayIconProps } from "./TrayIconProps";
import { ClassicTrayIcon } from "./ClassicTrayIcon";
import { MinimalTrayIcon } from "./MinimalTrayIcon";

export * from "./TrayIconProps";
export * from "./ClassicTrayIcon";
export * from "./MinimalTrayIcon";

/**
 * A `null` renderer means the style has no icon graphic at all
 * (e.g. text-only), so the canvas-render step should be skipped entirely.
 */
export const TRAY_ICON_RENDERERS: Record<
  TrayIconStyle,
  React.FC<TrayIconProps> | null
> = {
  [TrayIconStyle.CLASSIC]: ClassicTrayIcon,
  [TrayIconStyle.MINIMAL]: MinimalTrayIcon,
  [TrayIconStyle.ICON_TEXT]: MinimalTrayIcon,
  [TrayIconStyle.TEXT_ONLY]: null,
};
