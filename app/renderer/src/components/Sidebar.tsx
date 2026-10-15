import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "hooks/storeHooks";
import { APP_NAME, dashboardRoutes } from "config";
import { getFromStorage, saveToStorage } from "utils";
import {
  StyledSidebar,
  StyledSidebarBrand,
  StyledSidebarCollapse,
  StyledSidebarLink,
  StyledSidebarNotify,
} from "styles";
import SVG from "./SVG";

const COLLAPSED_KEY = "pomatez_sidebar_collapsed";

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const state = useAppSelector((state) => state);
  const items = dashboardRoutes(state);
  const [collapsed, setCollapsed] = useState<boolean>(
    () => getFromStorage(COLLAPSED_KEY) === true
  );

  const toggle = () => {
    setCollapsed(!collapsed);
    saveToStorage(COLLAPSED_KEY, !collapsed);
  };

  return (
    <StyledSidebar collapsed={collapsed} id="dashboard-sidebar">
      <StyledSidebarBrand collapsed={collapsed}>
        {!collapsed && <span>{APP_NAME}</span>}
        <StyledSidebarCollapse
          type="button"
          aria-label={t(collapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
          aria-controls="dashboard-sidebar"
          aria-expanded={!collapsed}
          title={t(collapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
          onClick={toggle}
        >
          <SVG name={collapsed ? "arrow-right" : "arrow-left"} />
        </StyledSidebarCollapse>
      </StyledSidebarBrand>
      {items.map(({ name, icon, exact, path, notify }) => (
        <StyledSidebarLink
          key={path}
          exact={exact}
          to={path}
          draggable="false"
          replace
          title={collapsed ? t(name) : undefined}
          $collapsed={collapsed}
        >
          <SVG name={icon} />
          {/* Kept for screen readers when collapsed; hidden visually. */}
          <span className="label">{t(name)}</span>
          {notify && <StyledSidebarNotify />}
        </StyledSidebarLink>
      ))}
    </StyledSidebar>
  );
};

export default React.memo(Sidebar);
