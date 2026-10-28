import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  setShowNotchIsland,
  setShowTimerInTrayBar,
  setTrayIconStyle,
  setUseNativeTitlebar,
  setEnableProgressAnimation,
} from "store";
import {
  SegmentedControl,
  TogglerProps,
  TRAY_ICON_RENDERERS,
} from "components";
import { detectOS } from "utils";
import { isMacElectron } from "utils/isMacElectron";
import { TrayIconStyle } from "store/settings/types";

import SettingSection from "./SettingSection";
import { SettingRow, SettingToggle, rowSearchText } from "./SettingRow";

const TRAY_STYLES: {
  value: TrayIconStyle;
  labelKey: string;
  macOSOnly?: boolean;
}[] = [
  { value: TrayIconStyle.CLASSIC, labelKey: "trayIconStyleClassic" },
  { value: TrayIconStyle.MINIMAL, labelKey: "trayIconStyleMinimal" },
  {
    value: TrayIconStyle.ICON_TEXT,
    labelKey: "trayIconStyleIconText",
    macOSOnly: true,
  },
  {
    value: TrayIconStyle.TEXT_ONLY,
    labelKey: "trayIconStyleTextOnly",
    macOSOnly: true,
  },
];

const HardwareSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);
  const isMacOS = detectOS() === "MacOS";

  const menuBarToggles: (TogglerProps & { hidden?: boolean })[] = [
    {
      id: "show-notch-island",
      label: t("settings.showNotchIsland"),
      description: t("settings.showNotchIslandDesc"),
      checked: settings.showNotchIsland,
      hidden: !isMacOS,
      onChange: useCallback(() => {
        dispatch(setShowNotchIsland(!settings.showNotchIsland));
      }, [dispatch, settings.showNotchIsland]),
    },
    {
      id: "show-timer-in-tray-bar",
      label: t("settings.showTimerInTrayBar"),
      description: t("settings.showTimerInTrayBarDesc"),
      note: t("settings.menuBarCountdownDedupNote"),
      checked: settings.showTimerInTrayBar,
      hidden: !isMacOS,
      onChange: useCallback(() => {
        dispatch(setShowTimerInTrayBar(!settings.showTimerInTrayBar));
      }, [dispatch, settings.showTimerInTrayBar]),
    },
  ];

  const windowToggles: (TogglerProps & { hidden?: boolean })[] = [
    {
      id: "native-titlebar",
      hidden: isMacElectron(),
      label: t("settings.nativeTitlebar"),
      description: t("settings.nativeTitlebarDesc"),
      checked: settings.useNativeTitlebar,
      onChange: useCallback(() => {
        dispatch(setUseNativeTitlebar(!settings.useNativeTitlebar));
      }, [dispatch, settings.useNativeTitlebar]),
    },
    {
      id: "progress-animation",
      label: t("settings.progressAnimation"),
      description: t("settings.progressAnimationDesc"),
      checked: settings.enableProgressAnimation,
      onChange: useCallback(() => {
        dispatch(
          setEnableProgressAnimation(!settings.enableProgressAnimation)
        );
      }, [dispatch, settings.enableProgressAnimation]),
    },
  ];

  const visibleWindowToggles = windowToggles.filter(
    (toggle) => !toggle.hidden
  );
  const trayStyle = {
    label: t("settings.trayIconStyle"),
    description: t("settings.trayIconStyleDesc"),
  };

  const onTrayStyleChange = useCallback(
    (value: TrayIconStyle) => dispatch(setTrayIconStyle(value)),
    [dispatch]
  );

  const visibleMenuBarToggles = menuBarToggles.filter(
    (toggle) => !toggle.hidden
  );

  return (
    <SettingSection
      id="settings-hardware"
      heading={t("settings.groupHardware")}
      searchText={rowSearchText([
        ...visibleMenuBarToggles,
        trayStyle,
        ...visibleWindowToggles,
      ])}
    >
      {visibleMenuBarToggles.map(({ hidden, ...toggle }) => (
        <SettingToggle key={toggle.id} {...toggle} />
      ))}
      <SettingRow {...trayStyle}>
        <SegmentedControl
          ariaLabel={trayStyle.label}
          value={settings.trayIconStyle}
          onChange={onTrayStyleChange}
          options={TRAY_STYLES.map(({ value, labelKey, macOSOnly }) => {
            const Preview = TRAY_ICON_RENDERERS[value];
            const disabled = Boolean(macOSOnly) && !isMacOS;
            return {
              value,
              disabled,
              title: disabled ? t("settings.macOSOnly") : undefined,
              label: (
                <>
                  {Preview && (
                    <span className="preview" aria-hidden>
                      <Preview timerType={undefined} dashOffset={12} />
                    </span>
                  )}
                  {t(`settings.${labelKey}`)}
                </>
              ),
            };
          })}
        />
      </SettingRow>
      {visibleWindowToggles.map(({ hidden, ...toggle }) => (
        <SettingToggle key={toggle.id} {...toggle} />
      ))}
    </SettingSection>
  );
};

export default HardwareSection;
