import styled, { css } from "styled-components/macro";
import { NavLink } from "react-router-dom";
import { themes } from "../themes";
import { typeStyle } from "styles/mixins";

export const StyledDashboard = styled.div`
  flex: 1 1;
  min-height: 0;
  display: flex;

  @media (max-width: 1000px), (max-height: 500px) {
    flex-direction: column;
  }
`;

/** layout.dashboard.sidebar; `collapsed` is the icon-only rail. */
export const StyledSidebar = styled.nav<{ collapsed?: boolean }>`
  flex: 0 0
    ${(p) =>
      p.collapsed
        ? "var(--layout-dashboard-sidebar-collapsed-width)"
        : "var(--layout-dashboard-sidebar-width)"};
  transition: flex-basis var(--motion-duration-base)
    var(--motion-easing-standard);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  display: flex;
  flex-direction: column;
  gap: var(--layout-dashboard-sidebar-item-gap);

  padding: 0 var(--layout-dashboard-sidebar-padding-x) var(--space-6);

  background-color: var(--layout-dashboard-sidebar-bg);
  overflow-x: hidden;
  overflow-y: auto;

  @media (max-width: 1000px), (max-height: 500px) {
    flex: 0 0 auto;
    flex-direction: row;
    gap: 4px;
    padding: 4px;
    overflow: auto;

    > div:first-child { display: none; }

    > a, > button {
      flex: 0 0 auto;
      padding: 8px;
      gap: 8px;
      margin-top: 0 !important;
    }

    .label {
      position: static;
      width: auto;
      height: auto;
      clip-path: none;
      overflow: visible;
    }
  }
`;

export const StyledSidebarBrand = styled.div<{ collapsed?: boolean }>`
  flex: 0 0 var(--layout-dashboard-sidebar-brand-height);

  display: flex;
  align-items: center;
  justify-content: ${(p) => (p.collapsed ? "center" : "space-between")};
  gap: var(--space-2);
  padding: 0 ${(p) => (p.collapsed ? "0" : "var(--space-2) 0 var(--space-4)")};

  ${typeStyle("brand")};
  color: var(--color-text-sidebar-active);

  & > span {
    overflow: hidden;
    white-space: nowrap;
  }
`;

/** layout.dashboard.sidebar.collapseButton */
export const StyledSidebarCollapse = styled.button`
  flex-shrink: 0;
  width: var(--layout-dashboard-sidebar-collapse-button-size);
  height: var(--layout-dashboard-sidebar-collapse-button-size);

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--layout-dashboard-sidebar-collapse-button-icon);
  border: none;
  border-radius: var(--layout-dashboard-sidebar-collapse-button-radius);
  background-color: var(--layout-dashboard-sidebar-collapse-button-bg);
  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    background-color: var(--color-background-surface);
  }

  &:focus-visible {
    outline: var(--border-width-thick) solid
      var(--color-border-sidebar-active);
    outline-offset: 2px;
  }

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;

export const StyledSidebarLink = styled(NavLink)<{ $collapsed?: boolean }>`
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

  .label {
    overflow: hidden;
    white-space: nowrap;
  }

  ${(p) =>
    p.$collapsed &&
    css`
      justify-content: center;
      padding: 0;

      /* Visually hidden, still the link's accessible name. */
      .label {
        position: absolute;
        width: 1px;
        height: 1px;
        clip-path: inset(50%);
      }

      ${StyledSidebarNotify} {
        position: absolute;
        top: var(--space-3);
        right: var(--space-3);
      }
    `}
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
  min-height: 0;

  @media (max-width: 1000px), (max-height: 500px) {
    overflow: auto;
  }
  flex: 1 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
`;

export const StyledDashboardBody = styled.div`
  flex: 1 1;
  min-height: 0;

  display: flex;

  @media (max-width: 1000px), (max-height: 500px) {
    flex: 0 0 auto;
    flex-direction: column;
  }
`;

export const StyledDashboardContent = styled.div`
  flex: 1 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  background-color: var(--layout-dashboard-content-bg);

  @media (max-width: 1000px), (max-height: 500px) {
    flex: 0 0 auto;

    > main {
      height: auto;
      flex: 0 0 auto;
      overflow: visible;
    }
  }
`;

/**
 * Persistent Timer widget shown on every dashboard page (RightRail.tsx).
 * `compact` (Workspace): no divider, so board and rail read as one page;
 * top padding matches StyledControlPanel so both headers line up; fixed
 * height, where only the agenda scrolls.
 */
export const StyledRightRail = styled.aside<{ compact?: boolean }>`
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

  ${(p) =>
    p.compact &&
    css`
      gap: var(--space-3);
      /* Top matches the Workspace content padding so headers align. */
      padding: var(--space-4)
        var(--layout-dashboard-right-rail-padding-x) var(--space-4);
      overflow: hidden;
      border-left: none;
    `}
  @media (max-width: 1000px), (max-height: 500px) {
    flex: 0 0 auto;
    min-width: 0;
    overflow: visible;
    border-left: none;

    > main { height: auto; flex: 0 0 auto; }
  }
`;

export const StyledRightRailHeading = styled.h3`
  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);
`;
