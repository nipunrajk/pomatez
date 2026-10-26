import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  setOpenAtLogin,
  setAlwaysOnTop,
  setMinimizeToTray,
  setCloseToTray,
  setEnableUsageTracking,
  setEnableRPC,
} from "store";
import { TogglerProps } from "components";
import { detectOS } from "utils";

import SettingSection from "./SettingSection";
import { SettingToggle, rowSearchText } from "./SettingRow";

const SystemSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const os = detectOS();

  const toggles: (TogglerProps & { hidden?: boolean })[] = [
    {
      id: "open-at-login",
      label: t("settings.openAtLogin"),
      description: t("settings.openAtLoginDesc"),
      checked: settings.openAtLogin,
      hidden: os === "Linux",
      onChange: useCallback(() => {
        dispatch(setOpenAtLogin(!settings.openAtLogin));
      }, [dispatch, settings.openAtLogin]),
    },
    {
      id: "always-on-top",
      label: t("settings.alwaysOnTop"),
      description: t("settings.alwaysOnTopDesc"),
      checked: settings.alwaysOnTop,
      onChange: useCallback(() => {
        dispatch(setAlwaysOnTop(!settings.alwaysOnTop));
      }, [dispatch, settings.alwaysOnTop]),
    },
    {
      id: "minimize-to-tray",
      label: t("settings.minimizeToTray"),
      description: t("settings.minimizeToTrayDesc"),
      checked: settings.minimizeToTray,
      onChange: useCallback(() => {
        dispatch(setMinimizeToTray(!settings.minimizeToTray));
      }, [dispatch, settings.minimizeToTray]),
    },
    {
      id: "close-to-tray",
      label: t("settings.closeToTray"),
      description: t("settings.closeToTrayDesc"),
      checked: settings.closeToTray,
      onChange: useCallback(() => {
        dispatch(setCloseToTray(!settings.closeToTray));
      }, [dispatch, settings.closeToTray]),
    },
    {
      id: "enable-usage-tracking",
      label: t("settings.enableUsageTracking"),
      description: t("settings.enableUsageTrackingDesc"),
      checked: settings.enableUsageTracking,
      hidden: os !== "MacOS",
      onChange: useCallback(() => {
        dispatch(setEnableUsageTracking(!settings.enableUsageTracking));
      }, [dispatch, settings.enableUsageTracking]),
    },
    {
      id: "enable-rpc",
      label: t("settings.enableRichPresence"),
      description: t("settings.enableRichPresenceDesc"),
      checked: settings.enableRPC,
      onChange: useCallback(() => {
        dispatch(setEnableRPC(!settings.enableRPC));
      }, [dispatch, settings.enableRPC]),
    },
  ];

  const visible = toggles.filter((toggle) => !toggle.hidden);

  return (
    <SettingSection
      id="settings-system"
      heading={t("settings.groupSystem")}
      searchText={rowSearchText(visible)}
    >
      {visible.map(({ hidden, ...toggle }) => (
        <SettingToggle key={toggle.id} {...toggle} />
      ))}
    </SettingSection>
  );
};

export default SystemSection;
