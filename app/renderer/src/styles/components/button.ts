import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { focusRing, typeStyle } from "styles/mixins";

const ButtonStyles = css`
  position: relative;

  width: 100%;
  min-width: max-content;
  height: var(--component-button-height-md);

  padding: 0 var(--component-button-padding-x);

  display: flex;
  align-items: center;
  justify-content: center;

  ${typeStyle("button")};

  border-radius: var(--component-button-radius);
  border: var(--border-width-hairline) solid transparent;
  background-color: transparent;

  cursor: pointer;

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);

    margin-right: var(--space-2);
  }

  transition: ${themes.transition};

  ${focusRing};

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/** Outlined pill: tags and secondary actions per components.button.outline. */
const OutlinePill = css`
  ${ButtonStyles};
  ${typeStyle("tag")};

  color: var(--component-button-outline-text);
  border-color: var(--component-button-outline-border);
  border-radius: var(--component-button-outline-radius);
  background-color: var(--component-button-outline-bg);

  &:hover:not(:disabled) {
    background-color: var(--color-background-surface-sunken);
  }

  &:active:not(:disabled) {
    background-color: var(--color-brand-primary-muted);
  }
`;

/** Ghost: components.button.ghost. */
export const StyledButton = styled.button`
  ${ButtonStyles};
  /* ghost.text (#8C8C80) is below 4.5:1 at 15px; readable variant. */
  color: var(--color-text-secondary-readable);

  &:hover:not(:disabled),
  &:focus-visible {
    color: var(--component-button-ghost-hover-text);
  }

  &:active:not(:disabled) {
    background-color: var(--color-background-surface-sunken);
  }
`;

export const StyledButtonNormal = styled.button`
  ${OutlinePill};
`;

export const StyledButtonPrimary = styled.button`
  ${ButtonStyles};
  color: var(--component-button-primary-text);
  background-color: var(--component-button-primary-bg);
  box-shadow: var(--shadow-button);

  &:hover:not(:disabled) {
    background-color: var(--component-button-primary-hover-bg);
  }

  &:active:not(:disabled) {
    background-color: var(--color-brand-primary-active);
  }
`;

export const StyledButtonSecondary = styled.button`
  ${OutlinePill};
`;

export const StyledButtonDanger = styled.button`
  ${OutlinePill};

  &:hover:not(:disabled),
  &:focus-visible {
    color: var(--color-status-danger-readable);
    border-color: var(--color-status-danger);
    background-color: rgba(var(--color-status-danger-rgb), 0.08);
  }
`;
