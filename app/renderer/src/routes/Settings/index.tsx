import React from "react";
import { StyledSettings, StyledSettingsTileRow } from "styles";

import FeatureSection from "./FeatureSection";
import LayoutSection from "./LayoutSection";
import TrayIconSection from "./TrayIconSection";
import LanguageSection from "./LanguageSection";
import HelpSection from "./HelpSection";
import DataSection from "./DataSection";
import ObsidianSection from "./ObsidianSection";
import ShortcutSection from "./ShortcutSection";
import SettingHeader from "./SettingHeader";
import { useAppSelector } from "hooks/storeHooks";
import { Updater } from "../../components";

export default function Settings() {
  const update = useAppSelector((state) => state.update);

  return update.updateBody ? (
    <Updater />
  ) : (
    <StyledSettings>
      <SettingHeader />
      <StyledSettingsTileRow>
        <LayoutSection />
        <LanguageSection />
        <TrayIconSection />
      </StyledSettingsTileRow>
      <FeatureSection />
      <DataSection />
      <ObsidianSection />
      <ShortcutSection />
      <HelpSection />
    </StyledSettings>
  );
}
