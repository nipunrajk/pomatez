import styled from "styled-components/macro";
import { NavLink } from "react-router-dom";
import { themes } from "../themes";
import { typeStyle } from "styles/mixins";

export const StyledDashboard = styled.div`
  flex: 1 1;
  min-height: 0;
  display: flex;
`;

/** layout.dashboard.sidebar */
export const StyledSidebar = styled.nav`
  flex: 0 0 var(--layout-dashboard-sidebar-width);

  display: flex;
  flex-direction: column;
  gap: var(--layout-dashboard-sidebar-item-gap);

  padding: 0 var(--layout-dashboard-sidebar-padding-x) var(--space-6);

  background-color: var(--layout-dashboard-sidebar-bg);
  overflow-y: auto;
`;

export const StyledSidebarBrand = styled.div`
  flex: 0 0 var(--layout-dashboard-sidebar-brand-height);

  display: flex;
  align-items: center;
  padding: 0 var(--space-4);

  ${typeStyle("brand")};
  color: var(--color-text-sidebar-active);
`;

export const StyledSidebarLink = styled(NavLink)`
  position: relative;

  flex: 0 0 var(--layout-dashboard-sidebar-item-height);
  padding: 0 var(--space-5);

  display: flex;
  align-items: center;
  gap: var(--space-3);

  ${typeStyle("nav-item")};
  /* sidebarInactive (#859EB7) is 4.0:1 on navy; readable variant. */
  color: var(--color-text-sidebar-inactive-readable);

  border-radius: var(--layout-dashboard-sidebar-item-radius);
  border: var(--layout-dashboard-sidebar-item-active-border-width) solid
    transparent;
  transition: ${themes.transition};

  svg {
    flex-shrink: 0;
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    color: var(--color-icon-on-sidebar);
    transition: ${themes.transition};
  }

  &:hover {
    color: var(--layout-dashboard-sidebar-item-active-text);

    svg {
      color: var(--color-icon-on-sidebar-active);
    }
  }

  &:focus-visible {
    outline: var(--border-width-thick) solid
      var(--color-border-sidebar-active);
    outline-offset: 2px;
  }

  &.active {
    color: var(--layout-dashboard-sidebar-item-active-text);
    border-color: var(--layout-dashboard-sidebar-item-active-border);
    background-color: var(--layout-dashboard-sidebar-item-active-bg);

    svg {
      color: var(--color-icon-on-sidebar-active);
    }
  }
`;

export const StyledSidebarNotify = styled.span`
  width: var(--component-status-dot-size);
  height: var(--component-status-dot-size);
  margin-left: auto;

  border-radius: var(--component-status-dot-radius);
  background-color: var(--color-status-notification);
`;

/** Everything right of the sidebar: optional top bar over content + rail. */
export const StyledDashboardMain = styled.div`
  flex: 1 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
`;

export const StyledDashboardBody = styled.div`
  flex: 1 1;
  min-height: 0;

  display: flex;
`;

export const StyledDashboardContent = styled.div`
  flex: 1 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  background-color: var(--layout-dashboard-content-bg);
`;

/** Persistent Timer widget shown on every dashboard page (RightRail.tsx). */
export const StyledRightRail = styled.aside`
  flex: 0 0 var(--layout-dashboard-right-rail-width);

  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  padding: var(--layout-dashboard-content-padding-y)
    var(--layout-dashboard-right-rail-padding-x);
  overflow-y: auto;

  background-color: var(--layout-dashboard-right-rail-bg);
  border-left: var(--border-width-hairline) solid
    var(--layout-dashboard-right-rail-divider-color);
`;

export const StyledRightRailHeading = styled.h3`
  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);
`;
