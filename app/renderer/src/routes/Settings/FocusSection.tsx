import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  setEnableStrictMode,
  setEnableFullscreenBreak,
  setAutoStartWorkTime,
  setEnableVoiceAssistance,
  setNotificationType,
} from "store";
import { SegmentedControl, TogglerProps } from "components";
import { NotificationTypes } from "store/settings/types";

import SettingSection from "./SettingSection";
import { SettingRow, SettingToggle, rowSearchText } from "./SettingRow";

const FocusSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  const toggles: TogglerProps[] = [
    {
      id: "strict-mode",
      label: t("settings.strictMode"),
      description: t("settings.strictModeDesc"),
      checked: settings.enableStrictMode,
      onChange: useCallback(() => {
        dispatch(setEnableStrictMode(!settings.enableStrictMode));
      }, [dispatch, settings.enableStrictMode]),
    },
    {
      id: "fullscreen-break",
      label: t("settings.fullscreenBreak"),
      description: t("settings.fullscreenBreakDesc"),
      checked: settings.enableFullscreenBreak,
      onChange: useCallback(() => {
        dispatch(
          setEnableFullscreenBreak(!settings.enableFullscreenBreak)
        );
      }, [dispatch, settings.enableFullscreenBreak]),
    },
    {
      id: "auto-start-work-time",
      label: t("settings.autoStartWorkTime"),
      description: t("settings.autoStartWorkTimeDesc"),
      checked: settings.autoStartWorkTime,
      onChange: useCallback(() => {
        dispatch(setAutoStartWorkTime(!settings.autoStartWorkTime));
      }, [dispatch, settings.autoStartWorkTime]),
    },
    {
      id: "voice-assistance",
      label: t("settings.voiceAssistance"),
      description: t("settings.voiceAssistanceDesc"),
      checked: settings.enableVoiceAssistance,
      onChange: useCallback(() => {
        dispatch(
          setEnableVoiceAssistance(!settings.enableVoiceAssistance)
        );
      }, [dispatch, settings.enableVoiceAssistance]),
    },
  ];

  const notifications = {
    label: t("settings.notificationTypes"),
    description: t("settings.notificationTypesDesc"),
  };

  const onNotificationChange = useCallback(
    (value: NotificationTypes) => dispatch(setNotificationType(value)),
    [dispatch]
  );

  return (
    <SettingSection
      id="settings-focus"
      heading={t("settings.groupFocus")}
      searchText={rowSearchText([...toggles, notifications])}
    >
      {toggles.map((toggle) => (
        <SettingToggle key={toggle.id} {...toggle} />
      ))}
      <SettingRow {...notifications}>
        <SegmentedControl
          ariaLabel={notifications.label}
          value={settings.notificationType}
          onChange={onNotificationChange}
          options={[
            {
              value: NotificationTypes.NONE,
              label: t("settings.notificationNone"),
            },
            {
              value: NotificationTypes.NORMAL,
              label: t("settings.notificationNormal"),
            },
            {
              value: NotificationTypes.EXTRA,
              label: t("settings.notificationExtra"),
            },
          ]}
        />
      </SettingRow>
    </SettingSection>
  );
};

export default FocusSection;
