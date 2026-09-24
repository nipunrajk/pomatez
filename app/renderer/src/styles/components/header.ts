import styled, { css } from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";
import { themes } from "styles/themes";

type WideProps = { wide?: boolean };

/**
 * Default: the narrow classic-window header (card-title size, no side
 * padding). `wide`: the dashboard's sticky page header, matching Day's
 * StyledDayTopBar (page-title size, side padding, hairline rule).
 */
export const StyledHeader = styled.header<WideProps>`
  width: 100%;
  height: max-content;

  margin-top: 1.6rem;
  margin-bottom: 0.4rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  ${(p) =>
    p.wide &&
    css`
      position: sticky;
      top: 0;
      z-index: 2;

      height: var(--layout-dashboard-header-height);
      margin: 0 0 var(--layout-dashboard-content-padding-y);

      /* No horizontal padding here: the page container already provides
         it, so the header's border/background stay flush with the rest
         of the page's content instead of double-indenting. */
      background-color: var(--layout-dashboard-header-bg);
      border-bottom: var(--border-width-hairline) solid
        var(--layout-dashboard-header-border-bottom);
    `}
`;

export const StyledHeaderHeading = styled.h3<WideProps>`
  ${(p) => typeStyle(p.wide ? "page-title" : "card-title")};
  color: var(--color-text-heading);
`;

type HeaderButtonTypes = { success?: boolean };

/** Ghost action (components.button.ghost), e.g. "Restore Default". */
export const StyledHeaderButton = styled.button<HeaderButtonTypes>`
  height: var(--component-button-height-sm);
  padding: 0 var(--space-2);

  ${typeStyle("button")};
  color: var(--color-text-secondary-readable);
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  cursor: pointer;

  transition: ${themes.transition};

  &:hover,
  &:focus-visible {
    color: var(--component-button-ghost-hover-text);
  }

  ${focusRing};

  &,
  &:hover {
    color: ${(p) =>
      p.success && "var(--color-status-completed-readable)"} !important;
  }
`;
