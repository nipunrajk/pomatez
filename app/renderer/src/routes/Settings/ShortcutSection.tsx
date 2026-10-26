import React from "react";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { ConnnectorContext } from "contexts/ConnnectorContext";
import { Shortcut } from "components";

import SettingSection from "./SettingSection";
import { useSettingsMatch } from "./SettingsFilterContext";

type ShortcutDef = { id: string; name: string; shortcutKey: string };

const FilteredShortcut: React.FC<ShortcutDef> = (props) =>
  useSettingsMatch(props.name, props.shortcutKey) ? (
    <Shortcut {...props} />
  ) : null;

const ShortcutGroup: React.FC<{
  heading: string;
  shortcuts: ShortcutDef[];
}> = ({ heading, shortcuts }) => (
  <>
    <h5 className="setting-subhead">{heading}</h5>
    {shortcuts.map((shortcut) => (
      <FilteredShortcut key={shortcut.id} {...shortcut} />
    ))}
  </>
);

const ShortcutSection: React.FC = () => {
  const { t } = useTranslation();

  const { onLayoutChange } = useContext(ConnnectorContext);
  const local: ShortcutDef[] = [
    ...(onLayoutChange
      ? [
          {
            id: "open-workspace",
            name: t("timer.openWorkspace"),
            shortcutKey: "⌘O",
          },
          {
            id: "open-hud",
            name: t("timer.collapseHud"),
            shortcutKey: "⌘⇧M",
          },
        ]
      : []),
    {
      id: "escape-form-popup",
      name: t("shortcuts.escapeFormPopup"),
      shortcutKey: t("shortcuts.pressEsc"),
    },
    {
      id: "toggle-themes",
      name: t("shortcuts.toggleTheme"),
      shortcutKey: "Alt + Shift + T",
    },
    {
      id: "cut-text",
      name: t("shortcuts.cutText"),
      shortcutKey: "Cmd/Ctrl + X",
    },
    {
      id: "copy-text",
      name: t("shortcuts.copyText"),
      shortcutKey: "Cmd/Ctrl + C",
    },
    {
      id: "paste-text",
      name: t("shortcuts.pasteText"),
      shortcutKey: "Cmd/Ctrl + V",
    },
    {
      id: "select-all-text",
      name: t("shortcuts.selectAllText"),
      shortcutKey: "Cmd/Ctrl + A",
    },
    {
      id: "undo-action",
      name: t("shortcuts.undoAction"),
      shortcutKey: "Cmd/Ctrl + Z",
    },
    {
      id: "redo-action",
      name: t("shortcuts.redoAction"),
      shortcutKey: "Cmd/Ctrl + Shift + Z",
    },
  ];

  const global: ShortcutDef[] = [
    {
      id: "hide-the-app",
      name: t("shortcuts.hideApp"),
      shortcutKey: "Alt + Shift + H",
    },
    {
      id: "show-the-app",
      name: t("shortcuts.showApp"),
      shortcutKey: "Alt + Shift + S",
    },
  ];

  return (
    <SettingSection
      id="settings-keys"
      heading={t("settings.groupKeyboard")}
      searchText={[...local, ...global].flatMap((s) => [
        s.name,
        s.shortcutKey,
      ])}
    >
      <ShortcutGroup
        heading={t("shortcuts.localHeading")}
        shortcuts={local}
      />
      <ShortcutGroup
        heading={t("shortcuts.globalHeading")}
        shortcuts={global}
      />
    </SettingSection>
  );
};

export default ShortcutSection;
