import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";

export const StyledCheckboxBox = styled.span<{ hidden?: boolean }>`
  width: 1.8rem;
  height: 1.8rem;

  display: ${({ hidden }) => (hidden ? "none" : "flex")};
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  margin-right: var(--space-2);

  border-radius: var(--radius-sm);
  border: var(--border-width-hairline) solid var(--color-border-strong);
  background-color: transparent;

  transition: ${themes.transition};

  &::after {
    content: "";

    height: 4px;
    width: 9px;

    margin-top: -2px;

    border-left: 1.5px solid;
    border-bottom: 1.5px solid;

    border-color: transparent;

    transform: rotate(-45deg) scale(0);
    transition: ${themes.transition};
  }
`;

export const StyledCheckboxLabel = styled.span`
  color: var(--color-text-primary);
  transition: ${themes.transition};
`;

/** Primary (settings choices) fills brand blue; tasks fill "completed". */
const accent = (asPrimary?: boolean) =>
  asPrimary
    ? "var(--color-brand-primary)"
    : "var(--color-status-completed)";

export const StyledCheckbox = styled.label<{
  asPrimary?: boolean;
}>`
  position: relative;

  & > input {
    position: absolute;
    width: 0;
    height: 0;

    margin: 0;
    opacity: 0;

    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  & > input:checked + ${StyledCheckboxBox} {
    border-color: ${(p) => accent(p.asPrimary)};
    background-color: ${(p) => accent(p.asPrimary)};
  }

  & > input:checked + ${StyledCheckboxBox}::after {
    border-color: var(--color-text-on-primary);
    transform: rotate(-45deg) scale(1);
  }

  & > input:focus-visible + ${StyledCheckboxBox} {
    outline: var(--border-width-thick) solid var(--color-border-focus);
    outline-offset: 2px;
  }

  & > input:disabled + ${StyledCheckboxBox} {
    opacity: 0.4;
  }

  ${(p) =>
    css`
      &:hover > input:not(:disabled) + ${StyledCheckboxBox} {
        border-color: ${accent(p.asPrimary)};
      }
    `}

  display: inline-flex;
  align-items: center;
  min-height: 3.2rem;

  text-transform: capitalize;
  cursor: pointer;

  user-select: none;
`;
