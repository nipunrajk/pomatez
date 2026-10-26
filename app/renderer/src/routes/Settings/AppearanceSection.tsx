import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { setEnableDarkTheme, setFollowSystemTheme, setLanguage } from "store";
import { SegmentedControl } from "components";
import { LanguageOption } from "store/settings/types";
import { StyledSelect, StyledSelectWrapper } from "styles";
import { supportedLanguages } from "i18n/languages";

import SettingSection from "./SettingSection";
import { SettingRow, rowSearchText } from "./SettingRow";

type ThemeMode = "system" | "light" | "dark";

const AppearanceSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { followSystemTheme, enableDarkTheme, language } = useAppSelector(
    (state) => state.settings
  );

  // Derived from the two stored flags; no separate theme-mode setting.
  const themeMode: ThemeMode = followSystemTheme
    ? "system"
    : enableDarkTheme
    ? "dark"
    : "light";

  const onThemeChange = useCallback(
    (mode: ThemeMode) => {
      if (mode === "system") {
        dispatch(setFollowSystemTheme(true));
        return;
      }
      dispatch(setFollowSystemTheme(false));
      dispatch(setEnableDarkTheme(mode === "dark"));
    },
    [dispatch]
  );

  const onLanguageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(setLanguage(event.target.value as LanguageOption));
    },
    [dispatch]
  );

  const theme = {
    label: t("settings.colorTheme"),
    description: t("settings.colorThemeDesc"),
  };
  const languageRow = {
    label: t("settings.language"),
    description: t("settings.languageDesc"),
  };

  return (
    <SettingSection
      id="settings-appearance"
      heading={t("settings.groupAppearance")}
      searchText={rowSearchText([theme, languageRow])}
    >
      <SettingRow {...theme}>
        <SegmentedControl
          ariaLabel={theme.label}
          value={themeMode}
          onChange={onThemeChange}
          options={[
            { value: "system", label: t("settings.themeSystem") },
            { value: "light", label: t("settings.themeLight") },
            { value: "dark", label: t("settings.themeDark") },
          ]}
        />
      </SettingRow>
      <SettingRow {...languageRow}>
        <StyledSelectWrapper style={{ width: "20rem" }}>
          <StyledSelect
            aria-label={languageRow.label}
            value={language}
            onChange={onLanguageChange}
          >
            <option value="auto">{t("settings.languageAuto")}</option>
            {supportedLanguages.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
        </StyledSelectWrapper>
      </SettingRow>
    </SettingSection>
  );
};

export default AppearanceSection;
