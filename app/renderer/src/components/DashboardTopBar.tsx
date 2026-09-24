import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  StyledButtonPrimary,
  StyledTopBar,
  StyledTopBarActions,
  StyledTopBarAvatar,
  StyledTopBarDot,
  StyledTopBarIconButton,
  StyledTopBarSearch,
} from "styles";
import { useAppSelector } from "hooks/storeHooks";
import { detectOS } from "utils";
import SVG from "./SVG";

/** Control Panel's header, spanning the content column and right rail. */
const DashboardTopBar: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const searchRef = useRef<HTMLInputElement>(null);
  const hasUpdate = useAppSelector(
    (state) => !!state.update.updateBody
  );

  const isMac = detectOS() === "MacOS";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (isMac ? e.metaKey : e.ctrlKey) &&
        e.key.toLowerCase() === "k"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMac]);

  return (
    <StyledTopBar>
      <h2>{t("controlPanel.title")}</h2>

      <StyledTopBarSearch>
        <SVG name="search" />
        <input
          ref={searchRef}
          type="text"
          role="searchbox"
          aria-label={t("controlPanel.searchLabel")}
          placeholder={t("controlPanel.searchPlaceholder")}
        />
        <kbd>{isMac ? "⌘K" : "Ctrl+K"}</kbd>
      </StyledTopBarSearch>

      <StyledTopBarActions>
        <StyledButtonPrimary
          onClick={() => history.push("/task-list?add=list")}
        >
          <SVG name="add" />
          {t("controlPanel.createNew")}
        </StyledButtonPrimary>

        {/* The app's only notification source today is an available update. */}
        <StyledTopBarIconButton
          aria-label={t("controlPanel.notifications")}
          onClick={() => history.push("/settings")}
        >
          <SVG name="bell" />
          {hasUpdate && <StyledTopBarDot />}
        </StyledTopBarIconButton>

        <StyledTopBarAvatar
          role="img"
          aria-label={t("controlPanel.profile")}
        >
          <SVG name="user" />
        </StyledTopBarAvatar>
      </StyledTopBarActions>
    </StyledTopBar>
  );
};

export default React.memo(DashboardTopBar);
