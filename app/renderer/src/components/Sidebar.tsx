import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "hooks/storeHooks";
import { APP_NAME, dashboardRoutes } from "config";
import {
  StyledSidebar,
  StyledSidebarBrand,
  StyledSidebarLink,
  StyledSidebarNotify,
} from "styles";
import SVG from "./SVG";

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const state = useAppSelector((state) => state);
  const items = dashboardRoutes(state);

  return (
    <StyledSidebar>
      <StyledSidebarBrand>{APP_NAME}</StyledSidebarBrand>
      {items.map(({ name, icon, exact, path, notify }) => (
        <StyledSidebarLink
          key={path}
          exact={exact}
          to={path}
          draggable="false"
          replace
        >
          <SVG name={icon} />
          {t(name)}
          {notify && <StyledSidebarNotify />}
        </StyledSidebarLink>
      ))}
    </StyledSidebar>
  );
};

export default React.memo(Sidebar);
