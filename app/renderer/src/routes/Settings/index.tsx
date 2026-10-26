import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  StyledInput,
  StyledSettings,
  StyledSettingsColumn,
  StyledSettingsFilterBar,
  StyledSettingsTop,
} from "styles";

import LayoutSection from "./LayoutSection";
import FocusSection from "./FocusSection";
import HardwareSection from "./HardwareSection";
import SystemSection from "./SystemSection";
import AppearanceSection from "./AppearanceSection";
import ObsidianSection from "./ObsidianSection";
import DataSection from "./DataSection";
import ShortcutSection from "./ShortcutSection";
import AboutSection from "./AboutSection";
import SettingHeader from "./SettingHeader";
import SettingSection from "./SettingSection";
import { SettingsFilterContext } from "./SettingsFilterContext";
import { useAppSelector } from "hooks/storeHooks";
import { Updater } from "../../components";

const TOP = "top";

/** Jump pills, in page order; ids match each SettingSection's `id`. */
const PILLS = [
  { id: TOP, labelKey: "pillAll" },
  { id: "settings-focus", labelKey: "pillFocus" },
  { id: "settings-hardware", labelKey: "pillHardware" },
  { id: "settings-system", labelKey: "pillSystem" },
  { id: "settings-appearance", labelKey: "pillAppearance" },
  { id: "settings-data", labelKey: "pillData" },
  { id: "settings-keys", labelKey: "pillKeys" },
];

// Gap left between the sticky bar and a card jumped to.
const JUMP_GAP = 16;

const DataVaultSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <SettingSection
      id="settings-data"
      heading={t("settings.groupData")}
      searchText={[
        t("obsidian.heading"),
        t("obsidian.description"),
        t("data.heading"),
        t("data.description"),
      ]}
      padded
    >
      <ObsidianSection />
      <DataSection />
    </SettingSection>
  );
};

export default function Settings() {
  const { t } = useTranslation();
  const update = useAppSelector((state) => state.update);

  const scrollRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(TOP);
  const [empty, setEmpty] = useState(false);
  const normalized = query.trim().toLowerCase();

  /** Card top relative to the scroll area's visible top, under the bar. */
  const offsetBelowBar = useCallback((el: HTMLElement) => {
    const container = scrollRef.current;
    const bar = topRef.current;
    if (!container || !bar) return 0;
    return (
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      bar.offsetHeight
    );
  }, []);

  const updateActive = useCallback(() => {
    let current = TOP;
    for (const { id } of PILLS) {
      if (id === TOP) continue;
      const el = document.getElementById(id);
      if (el && offsetBelowBar(el) <= JUMP_GAP * 2) current = id;
    }
    setActive(current);
  }, [offsetBelowBar]);

  const jump = useCallback(
    (id: string) => {
      const container = scrollRef.current;
      if (!container) return;
      const el = id === TOP ? null : document.getElementById(id);
      const top = el
        ? container.scrollTop + offsetBelowBar(el) - JUMP_GAP
        : 0;
      container.scrollTo({ top, behavior: "smooth" });
      setActive(id);
    },
    [offsetBelowBar]
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.addEventListener("scroll", updateActive, { passive: true });
    return () => container.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  // Cards unmount when the search misses them; detect "nothing left".
  useLayoutEffect(() => {
    setEmpty(
      !columnRef.current?.querySelector("[data-settings-card]")
    );
    updateActive();
  }, [normalized, updateActive]);

  if (update.updateBody) return <Updater />;

  return (
    <StyledSettings ref={scrollRef}>
      <StyledSettingsColumn ref={columnRef}>
        <StyledSettingsTop ref={topRef}>
          <SettingHeader />
          <StyledSettingsFilterBar>
            <StyledInput
              value={query}
              placeholder={t("settings.searchPlaceholder")}
              aria-label={t("settings.searchPlaceholder")}
              onChange={(e) => setQuery(e.target.value)}
            />
            <nav className="pills" aria-label={t("settings.title")}>
              {PILLS.map(({ id, labelKey }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={active === id}
                  onClick={() => jump(id)}
                >
                  {t(`settings.${labelKey}`)}
                </button>
              ))}
            </nav>
          </StyledSettingsFilterBar>
        </StyledSettingsTop>

        <SettingsFilterContext.Provider value={normalized}>
          <LayoutSection />
          <FocusSection />
          <HardwareSection />
          <SystemSection />
          <AppearanceSection />
          <DataVaultSection />
          <ShortcutSection />
          <AboutSection />
        </SettingsFilterContext.Provider>

        {empty && (
          <p className="settings-empty">
            {t("settings.noMatches", { query: query.trim() })}
          </p>
        )}
      </StyledSettingsColumn>
    </StyledSettings>
  );
}
