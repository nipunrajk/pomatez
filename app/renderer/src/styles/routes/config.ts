import styled, { css } from "styled-components/macro";
import { StyledHeaderHeading } from "styles";
import { themes } from "styles/themes";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledConfig = styled.main`
  padding: 0 2rem;

  animation: 320ms ${themes.enterFromLeft} ease;

  position: relative;
`;

export const StyledConfigSliderSection = styled.section`
  width: 100%;
  height: max-content;

  display: grid;
  row-gap: 0.4rem;
`;

export const StyledConfigSpecialBreaks = styled.div`
  margin-top: 1.2rem;

  display: grid;
  row-gap: 1.2rem;
  column-gap: 1.2rem;
  grid-template-columns: repeat(2, 1fr);
`;

export const StyledSpecialBreakHeading = styled(StyledHeaderHeading)<{
  disabled?: boolean;
}>`
  grid-row: 1 / 2;
  grid-column: 1 / -1;

  color: ${(p) => p.disabled && "var(--color-text-tertiary)"};
`;

export const StyledSpecialClearButton = styled.button<{
  success?: boolean;
}>`
  position: absolute;
  top: 0;
  right: 0;

  width: 2rem;
  height: 2rem;

  margin-top: -1rem;
  margin-right: -1rem;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-icon-default);

  border: none;
  border-radius: var(--radius-circle);
  background-color: var(--color-background-surface);
  box-shadow: var(--shadow-floating);
  cursor: pointer;

  opacity: 0;
  visibility: hidden;
  transform: translateY(1rem);
  transition: all 320ms ease;

  &:hover {
    color: var(--color-status-danger-readable);
  }

  ${focusRing};

  & > svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  ${(p) =>
    p.success &&
    css`
      opacity: 0 !important;
      visibility: hidden !important;
      transform: translateY(1rem) !important;
    `}
`;

type SpecialBreakProps = {
  disabled?: boolean;
  success?: boolean;
};

export const StyledSpecialField = styled.div<SpecialBreakProps>`
  width: 100%;
  height: var(--component-button-height-md);

  display: grid;
  grid-template-columns: 1fr 1px 4.6rem;

  color: var(--component-input-text);
  border-radius: var(--component-input-radius);
  border: var(--border-width-hairline) solid
    var(--component-input-border);
  background-color: var(--component-input-bg);

  position: relative;

  &:focus-within {
    border-color: ${(p) =>
      p.disabled
        ? "var(--component-input-border)"
        : "var(--color-border-focus)"};
    box-shadow: ${(p) =>
      p.disabled
        ? "none"
        : "0 0 0 var(--border-width-hairline) var(--color-border-focus)"};
  }

  &:hover
    ${StyledSpecialClearButton},
    &:focus-within
    ${StyledSpecialClearButton} {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  & > input[type="time"] {
    border: none;
    background-color: transparent;

    &::-webkit-datetime-edit-fields-wrapper {
      color: ${(p) => p.disabled && "transparent"};
    }

    &::-webkit-calendar-picker-indicator {
      display: none;
    }

    &::-webkit-datetime-edit-text {
      margin: 0 0.2rem;
    }

    &::-webkit-datetime-edit {
      padding: 0.4rem 0.8rem;
    }
  }

  & > input[type="number"] {
    padding: 0.4rem 0.8rem;

    border: none;
    background-color: transparent;

    &::-webkit-inner-spin-button {
      display: none;
    }

    &::placeholder {
      color: ${(p) =>
        p.disabled
          ? "transparent"
          : "var(--color-text-placeholder-readable)"};
    }
  }

  & > span {
    width: 1px;
    height: 100%;

    background-color: var(--color-border-input);
  }

  ${(p) =>
    p.success &&
    css`
      animation: success 2s ease;
    `}

  @keyframes success {
    0% {
      border-color: var(--color-status-completed);
    }
    50% {
      border-color: var(--color-status-completed);
    }
    100% {
      border-color: var(--component-input-border);
    }
  }
`;

export const StyledSpecialBreakSetter = styled.form`
  width: 100%;
  height: 100%;

  padding: 1.6rem 2rem;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  background-color: var(--color-background-window);

  display: grid;
  row-gap: 2rem;
  align-content: start;
  grid-template-rows: max-content 1fr max-content;

  animation: enter 180ms ease;

  & > header {
    display: grid;
    row-gap: 0.4rem;

    & > h3 {
      ${typeStyle("card-title")};
      color: var(--color-text-heading);
    }

    & > p {
      width: 80%;
      color: var(--color-text-secondary-readable);
    }
  }

  @keyframes enter {
    0% {
      opacity: 0;
      margin-top: 1rem;
    }
    100% {
      opacity: 1;
      margin: 0;
    }
  }
`;

export const StyledSpecialBreakSetterSection = styled.section`
  display: grid;
  gap: 1.2rem;
  align-content: start;
  /* grid-template-columns: repeat(2, 1fr); */
`;

export const StyledSpecialBreakDuration = styled.div`
  grid-column: 1 / -1;
`;

export const StyledSpecialBreakDurationSpan = styled.span<{
  error?: boolean;
}>`
  font-weight: var(--font-weight-medium);
  color: ${(p) =>
    p.error
      ? "var(--color-status-danger-readable)"
      : "var(--color-brand-primary-readable)"};
`;

export const StyledSpecialBreakAction = styled.div`
  padding-bottom: 2rem;
`;
