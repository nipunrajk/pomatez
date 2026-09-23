import styled, { css } from "styled-components/macro";
import { NavLink } from "react-router-dom";
import { themes } from "../themes";

export const StyledDashboard = styled.div`
  flex: 1 1;
  min-height: 0;
  display: flex;
`;

export const StyledSidebar = styled.nav`
  flex: 0 0 8.8rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;

  padding: 2rem 0;

  background-color: var(--color-primary);
`;

export const StyledSidebarLink = styled(NavLink)`
  position: relative;

  width: 6.4rem;
  padding: 1rem 0 0.8rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;

  font-family: Typo-Round, sans-serif;
  font-size: 1.1rem;
  color: var(--color-text-sidebar-inactive-readable);

  border-radius: 0.8rem;
  transition: ${themes.transition};

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  &:hover {
    color: var(--color-text-sidebar-active);
    background-color: var(--layout-dashboard-sidebar-item-active-bg);
  }

  &.active {
    color: var(--color-text-sidebar-active);
    background-color: var(--layout-dashboard-sidebar-item-active-bg);
  }
`;

export const StyledSidebarNotify = styled.span`
  position: absolute;
  top: 0.8rem;
  right: 1.6rem;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background-color: var(--color-pink);
`;

export const StyledDashboardContent = styled.div<{ wide: boolean }>`
  flex: 1 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);

  ${(p) =>
    !p.wide &&
    css`
      align-items: center;
      justify-content: center;
      padding: 2.4rem;
      background-color: var(--color-bg-secondary);
    `}
`;

/** Keeps pages built for the 340px window at their original size. */
export const StyledClassicPageFrame = styled.div`
  width: 34rem;
  height: min(100%, 44rem);

  display: flex;
  flex-direction: column;

  border-radius: 0.8rem;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-primary);
  box-shadow: 0 0.8rem 3.2rem -1.2rem var(--color-shadow-primary);
  overflow: hidden;
`;
