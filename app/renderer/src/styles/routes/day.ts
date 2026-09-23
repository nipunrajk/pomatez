import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar } from "styles/mixins";

export const StyledDay = styled.main`
  flex: 1 1;
  min-height: 0;
  width: 100%;

  padding: 2.4rem 3.2rem 4rem;

  overflow: hidden auto;
  ${StyledScrollbar};

  animation: 240ms ${themes.enterFromRight} ease;
`;

export const StyledDayTopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.4rem;

  h2 {
    font-size: 2rem;
  }

  button {
    width: auto;
  }
`;

export const StyledDayGroup = styled.section`
  margin-bottom: 3.2rem;
`;

export const StyledDayGroupHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  padding: 0 1.6rem 1.2rem;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid var(--color-border-primary);

  h3 {
    font-size: 1.8rem;
    font-weight: 400;
    color: var(--color-heading-text);

    strong {
      font-weight: 600;
    }
  }
`;

export const StyledDayTotal = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--color-heading-text);
  font-variant-numeric: tabular-nums;
`;

export const StyledDayEmpty = styled.p`
  padding: 2rem 1.6rem;
  color: var(--color-disabled-text);
`;

type RowProps = { running: boolean; accent: string };

export const StyledEntryRow = styled.div<RowProps>`
  position: relative;

  display: grid;
  grid-template-columns: 12rem 0.3rem minmax(0, 1fr) 10rem 9.6rem 3.6rem 6.4rem;
  align-items: center;
  column-gap: 1.6rem;

  min-height: 7.2rem;
  padding: 0.8rem 1.6rem;

  border-radius: 0.6rem;
  transition: ${themes.transition};

  &:hover {
    background-color: var(--color-bg-secondary);
  }

  ${(p) =>
    p.running &&
    css`
      background-color: var(--color-bg-primary);
      box-shadow: 0 0.4rem 2.4rem -0.8rem var(--color-shadow-primary);

      &:hover {
        background-color: var(--color-bg-primary);
      }
    `}

  & > .accent {
    align-self: stretch;
    border-radius: 0.2rem;
    background-color: ${(p) => p.accent};
  }
`;

export const StyledEntryRange = styled.div`
  font-size: 1.4rem;
  color: var(--color-heading-text);
  font-variant-numeric: tabular-nums;

  span {
    color: var(--color-disabled-text);
  }
`;

export const StyledEntryText = styled.div`
  min-width: 0;

  small {
    display: block;
    margin-bottom: 0.2rem;
    font-size: 1.1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-disabled-text);
  }

  p {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--color-heading-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const StyledEntryProgress = styled.div<{
  percent: number | null;
  done: boolean;
}>`
  height: 0.3rem;
  border-radius: 0.2rem;
  background-color: var(--color-border-secondary);
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(p) => (p.percent === null ? 0 : p.percent)}%;
    background-color: ${(p) =>
      p.done ? "var(--color-green)" : "var(--color-yellow)"};
    transition: width 400ms ease;
  }
`;

export const StyledEntryDuration = styled.div<{ running: boolean }>`
  text-align: right;
  font-size: 1.5rem;
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.running ? "var(--color-heading-text)" : "var(--color-body-text)"};

  small {
    display: block;
    font-size: 1.1rem;
    color: var(--color-disabled-text);
  }
`;

export const StyledEntryPlay = styled.button<{ running: boolean }>`
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: ${(p) => (p.running ? "#fff" : "var(--color-body-text)")};
  background-color: ${(p) =>
    p.running ? "var(--color-primary)" : "var(--color-bg-tertiary)"};
  transition: ${themes.transition};

  &:hover:not(:disabled) {
    color: ${(p) => (p.running ? "#fff" : "var(--color-primary)")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
    fill: currentColor;
  }
`;

export const StyledEntryActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;

  opacity: 0;
  transition: ${themes.transition};

  ${StyledEntryRow}:hover &,
  &:focus-within {
    opacity: 1;
  }
`;

export const StyledIconButton = styled.button<{ danger?: boolean }>`
  width: 2.8rem;
  height: 2.8rem;
  border: none;
  border-radius: 0.4rem;
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: ${(p) =>
    p.danger ? "var(--color-pink)" : "var(--color-body-text)"};

  &:hover {
    background-color: var(--color-border-primary);
  }

  svg {
    width: 1.3rem;
    height: 1.3rem;
    fill: currentColor;
  }
`;

export const StyledEntryModeChip = styled.span<{ pomodoro: boolean }>`
  display: inline-block;
  margin-left: 0.8rem;
  padding: 0.1rem 0.6rem;
  border-radius: 1rem;
  font-size: 1rem;
  text-transform: none;
  letter-spacing: 0;
  color: ${(p) =>
    p.pomodoro ? "var(--color-pink)" : "var(--color-green)"};
  background-color: ${(p) =>
    p.pomodoro
      ? "rgba(var(--color-pink-rgb), 0.12)"
      : "rgba(var(--color-green-rgb), 0.12)"};
`;

export const StyledEntryForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) 11rem 11rem auto;
  gap: 1.2rem;
  align-items: end;

  padding: 1.6rem;
  margin-bottom: 1.2rem;

  border-radius: 0.6rem;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-secondary);

  label {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 1.2rem;
    color: var(--color-body-text);
  }

  .form-footer {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
  }

  .form-buttons {
    display: flex;
    gap: 0.8rem;

    button {
      width: auto;
    }
  }

  .form-error {
    color: var(--color-pink);
    font-size: 1.2rem;
  }
`;

// Not an extension of StyledInput: its attrs pin type="text".
export const StyledEntryTimeInput = styled.input.attrs(() => ({
  type: "time",
}))`
  width: 100%;
  height: 3.6rem;
  padding: 0.5rem 1rem;

  color: var(--color-heading-text);
  color-scheme: light dark;

  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-bg-input);

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 0.2rem rgba(var(--color-primary-rgb), 0.16);
  }
`;

export const StyledModeToggle = styled.div`
  display: inline-flex;
  height: 3.6rem;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  overflow: hidden;

  button {
    padding: 0 1.4rem;
    border: none;
    background: var(--color-bg-input);
    color: var(--color-body-text);
    cursor: pointer;
    transition: ${themes.transition};

    &[aria-pressed="true"] {
      color: #fff;
      background-color: var(--color-primary);
    }
  }
`;
