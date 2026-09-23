import styled, { css } from "styled-components/macro";
import { typeStyle } from "styles/mixins";

type TimeWrapperProps = { disabled?: boolean };

export const StyledTimeWrapper = styled.div<TimeWrapperProps>`
  width: 100%;
  height: max-content;

  display: grid;
  row-gap: 0.4rem;

  & > input[type="time"] {
    color: ${(p) => p.disabled && "transparent"};
    background-color: ${(p) =>
      p.disabled && "var(--color-background-surface-sunken)"};
  }
`;

export const StyledTimeInput = styled.input<{ error?: boolean }>`
  width: 100%;

  height: var(--component-button-height-md);
  padding: 0 var(--space-3);

  color: var(--component-input-text);
  color-scheme: light dark;
  border-radius: var(--component-input-radius);
  border: var(--border-width-hairline) solid
    var(--component-input-border);
  background-color: var(--component-input-bg);

  &::-webkit-datetime-edit-fields-wrapper {
    color: ${(p) => p.error && "var(--color-status-danger-readable)"};
  }

  &::-webkit-datetime-edit-text {
    margin: 0 0.2rem;
  }

  &::-webkit-calendar-picker-indicator {
    margin-top: 1px;
  }

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 var(--border-width-hairline)
      var(--color-border-focus);
  }

  &:focus ~ label {
    color: var(--color-brand-primary-readable);
  }

  ${(p) =>
    p.error &&
    css`
      border-color: var(--color-status-danger) !important;
      box-shadow: 0 0 0 var(--border-width-hairline)
        var(--color-status-danger) !important;

      & ~ label {
        color: var(--color-status-danger-readable) !important;
      }
    `}
`;

export const StyledTimeInputLabel = styled.label`
  grid-row: 1 / 2;

  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);
`;
