import styled from "styled-components/macro";
import { TimerStatus } from "store/timer/types";
import { NavLink } from "react-router-dom";
import { themes } from "../themes";
import { focusRing, timerColor, typeStyle } from "styles/mixins";

export const StyledNav = styled.nav<{ useNativeTitlebar: boolean }>`
  width: 100%;
  height: ${({ useNativeTitlebar }) =>
    useNativeTitlebar
      ? "var(--layout-compact-tab-bar-height)"
      : "4.8rem"};
  position: relative;
  background-color: var(--layout-compact-tab-bar-bg);

  &::before {
    content: "";

    position: absolute;
    left: 0;
    bottom: 0;

    width: 100%;
    height: 1px;

    background-color: var(--layout-compact-tab-bar-border);
  }
`;

export const StyledNavList = styled.ul`
  width: 100%;
  height: 100%;

  list-style: none;
  ${typeStyle("meta")};
  font-weight: var(--font-weight-medium);

  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const StyledNavListItem = styled.li`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

type NavLinkProps = { type?: TimerStatus };

export const StyledNavIconWrapper = styled.div`
  position: relative;
  box-sizing: content-box;
  width: fit-content;
  left: 50%;
  transform: translateX(-50%);
  height: 14px;
  margin-bottom: 0.4rem;
`;

export const StyledNavLink = styled(NavLink)<NavLinkProps>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  text-align: center;

  position: relative;
  cursor: pointer;

  /* tabBar.inactiveText (#8C8C80) is 3.1:1 at 12px; use the readable variant. */
  color: var(--color-text-secondary-readable);

  transition: ${themes.transition};

  &:hover {
    color: var(--color-text-primary);
  }

  ${focusRing};

  /* The Timer tab keeps following the timer state, as before. */
  &.active {
    color: ${(p) =>
      p.to === "/"
        ? timerColor(p.type, true)
        : "var(--color-brand-primary-readable)"};

    &::after {
      background-color: ${(p) =>
        p.to === "/"
          ? timerColor(p.type)
          : "var(--layout-compact-tab-bar-indicator-color)"};
    }
  }

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;

    width: 100%;
    height: var(--layout-compact-tab-bar-indicator-height);

    background-color: transparent;
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
    align-self: end;
  }
`;
