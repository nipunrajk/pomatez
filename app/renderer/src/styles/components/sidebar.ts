import styled, { css } from "styled-components/macro";
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

export const StyledDashboardContent = styled.div<{ wide: boolean }>`
  flex: 1 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  background-color: var(--layout-dashboard-content-bg);

  ${(p) =>
    !p.wide &&
    css`
      align-items: center;
      justify-content: center;
      padding: var(--layout-dashboard-content-padding-y)
        var(--layout-dashboard-content-padding-x);
    `}
`;

/**
 * Pages built for the 340px window keep their original width, as an
 * unboxed column on the cream content area.
 */
export const StyledClassicPageFrame = styled.div`
  width: var(--layout-compact-window-width);
  /* Taller than the 502px window so Settings and Tasks can breathe. */
  height: min(100%, 64rem);

  display: flex;
  flex-direction: column;

  background-color: var(--layout-compact-background);
  overflow: hidden;
`;
