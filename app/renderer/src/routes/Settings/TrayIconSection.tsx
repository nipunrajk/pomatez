import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { setTrayIconStyle } from "store";
import { Collapse, Radio, TRAY_ICON_RENDERERS } from "components";
import { detectOS } from "utils";
import { TrayIconStyle } from "store/settings/types";

import SettingSection from "./SettingSection";

const STYLE_OPTIONS: {
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

const TrayIconSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  const isMacOS = detectOS() === "MacOS";

  const onChangeTrayIconStyle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setTrayIconStyle(e.target.value as TrayIconStyle));
    },
    [dispatch]
  );

  return (
    <SettingSection heading={t("settings.trayIconStyle")}>
      <Collapse heading={t("settings.trayIconStyle")}>
        {STYLE_OPTIONS.map(({ value, labelKey, macOSOnly }) => {
          const disabled = Boolean(macOSOnly) && !isMacOS;
          const Preview = TRAY_ICON_RENDERERS[value];

          return (
            <Radio
              key={value}
              id={`tray-icon-style-${value}`}
              name="tray-icon-style"
              value={value}
              checked={settings.trayIconStyle === value}
              disabled={disabled}
              onChange={onChangeTrayIconStyle}
              label={
                <>
                  {Preview && (
                    <span
                      style={{
                        display: "inline-flex",
                        width: 16,
                        height: 16,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    >
                      <Preview timerType={undefined} dashOffset={12} />
                    </span>
                  )}
                  {value === TrayIconStyle.TEXT_ONLY && (
                    <span
                      style={{
                        marginRight: 8,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      12:34
                    </span>
                  )}
                  {t(`settings.${labelKey}`)}
                  {disabled && ` (${t("settings.macOSOnly")})`}
                </>
              }
            />
          );
        })}
      </Collapse>
    </SettingSection>
  );
};

export default TrayIconSection;
