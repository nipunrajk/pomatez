import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "hooks/storeHooks";
import { dashboardRoutes } from "config";
import {
  StyledSidebar,
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
