import styled from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";
import { themes } from "styles/themes";

export const StyledHeader = styled.header`
  width: 100%;
  height: max-content;

  margin-top: 1.6rem;
  margin-bottom: 0.4rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledHeaderHeading = styled.h3`
  ${typeStyle("card-title")};
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
