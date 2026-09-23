import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, focusRing, typeStyle } from "styles/mixins";

export const StyledDay = styled.main`
  flex: 1 1;
  min-height: 0;
  width: 100%;

  padding-bottom: var(--layout-dashboard-content-padding-y);

  overflow: hidden auto;
  ${StyledScrollbar};

  animation: 240ms ${themes.enterFromRight} ease;
`;

/** layout.dashboard.header: sticky page header with a hairline rule. */
export const StyledDayTopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 2;

  height: var(--layout-dashboard-header-height);
  padding: 0 var(--layout-dashboard-header-padding-x);
  margin-bottom: var(--layout-dashboard-content-padding-y);

  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: var(--layout-dashboard-header-bg);
  border-bottom: var(--border-width-hairline) solid
    var(--layout-dashboard-header-border-bottom);

  h2 {
    ${typeStyle("page-title")};
    color: var(--color-text-heading);
  }

  button {
    width: auto;
  }
`;

export const StyledDayGroup = styled.section`
  margin: 0 var(--layout-dashboard-content-padding-x);

  & + & {
    margin-top: var(--layout-dashboard-content-section-gap);
  }
`;

/** components.sectionHeader */
export const StyledDayGroupHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  padding-bottom: var(--component-section-header-padding-bottom);
  margin-bottom: var(--space-4);
  border-bottom: var(--component-section-header-divider-width) solid
    var(--component-section-header-divider);

  h3 {
    ${typeStyle("section-title")};
    color: var(--color-text-heading);
    font-variant-numeric: lining-nums;

    strong {
      font-weight: var(--font-weight-semibold);
    }
  }
`;

export const StyledDayTotal = styled.div`
  ${typeStyle("card-title")};
  font-variant-numeric: lining-nums tabular-nums;
  color: var(--color-text-primary);
`;

export const StyledDayEmpty = styled.p`
  padding: var(--space-5) 0;
  color: var(--color-text-secondary-readable);
`;

type RowProps = { running: boolean; accent: string };

/** Entry card (components.card). */
export const StyledEntryRow = styled.div<RowProps>`
  position: relative;

  display: grid;
  grid-template-columns: 12rem 0.3rem minmax(0, 1fr) 10rem 10rem 4rem 6.4rem;
  align-items: center;
  column-gap: var(--component-card-gap);

  min-height: 7.6rem;
  padding: var(--space-4) var(--component-card-padding);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);
  transition: box-shadow var(--motion-duration-base)
    var(--motion-easing-standard);

  & + & {
    margin-top: var(--layout-dashboard-content-board-card-gap);
  }

  &:hover {
    box-shadow: var(--shadow-card-hover);
  }

  ${(p) =>
    p.running &&
    css`
      box-shadow: 0 0 0 var(--border-width-hairline)
          var(--color-brand-primary),
        var(--shadow-card-hover);
    `}

  & > .accent {
    align-self: stretch;
    border-radius: var(--radius-pill);
    background-color: ${(p) => p.accent};
  }
`;

export const StyledEntryRange = styled.div`
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);

  span {
    color: var(--color-text-secondary-readable);
  }
`;

export const StyledEntryText = styled.div`
  min-width: 0;

  & > small {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);

    ${typeStyle("tag")};
    color: var(--color-text-secondary-readable);
  }

  p {
    ${typeStyle("card-title")};
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

/** components.tag: outlined pill. */
export const StyledEntryTag = styled.span`
  display: inline-flex;
  align-items: center;
  height: var(--component-tag-height);
  padding: 0 var(--component-tag-padding-x);

  ${typeStyle("tag")};
  color: var(--component-tag-text);
  border-radius: var(--component-tag-radius);
  border: var(--border-width-hairline) solid var(--component-tag-border);
`;

export const StyledEntryProgress = styled.div<{
  percent: number | null;
  done: boolean;
}>`
  height: var(--component-progress-bar-height);
  border-radius: var(--component-progress-bar-radius);
  background-color: var(--component-progress-bar-track);
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(p) => (p.percent === null ? 0 : p.percent)}%;
    border-radius: var(--component-progress-bar-radius);
    background-color: ${(p) =>
      p.done
        ? "var(--color-progress-fill-success)"
        : "var(--color-progress-fill-primary)"};
    transition: width var(--motion-duration-slow)
      var(--motion-easing-standard);
  }
`;

export const StyledEntryDuration = styled.div<{ running: boolean }>`
  text-align: right;
  ${typeStyle("card-title")};
  font-variant-numeric: lining-nums tabular-nums;
  color: ${(p) =>
    p.running
      ? "var(--color-brand-primary-readable)"
      : "var(--color-text-primary)"};

  small {
    display: block;
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary-readable);
  }
`;

/** components.button.icon; filled brand blue while running. */
export const StyledEntryPlay = styled.button<{ running: boolean }>`
  width: var(--component-button-icon-size);
  height: var(--component-button-icon-size);
  border-radius: var(--component-button-icon-radius);
  border: var(--border-width-hairline) solid
    ${(p) =>
      p.running
        ? "var(--color-brand-primary)"
        : "var(--component-button-icon-border)"};

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: ${(p) =>
    p.running
      ? "var(--color-text-on-primary)"
      : "var(--color-icon-default)"};
  background-color: ${(p) =>
    p.running
      ? "var(--color-brand-primary)"
      : "var(--component-button-icon-bg)"};
  transition: ${themes.transition};

  &:hover:not(:disabled) {
    background-color: ${(p) =>
      p.running
        ? "var(--color-brand-primary-hover)"
        : "var(--color-background-surface-sunken)"};
  }

  ${focusRing};

  &:disabled {
    opacity: 0.4;
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
  gap: var(--space-1);

  opacity: 0;
  transition: ${themes.transition};

  ${StyledEntryRow}:hover &,
  &:focus-within {
    opacity: 1;
  }
`;

export const StyledIconButton = styled.button<{ danger?: boolean }>`
  width: 3.2rem;
  height: 3.2rem;
  border: none;
  border-radius: var(--radius-circle);
  background: transparent;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  color: ${(p) =>
    p.danger
      ? "var(--color-status-danger-readable)"
      : "var(--color-icon-muted)"};

  &:hover {
    color: ${(p) =>
      p.danger
        ? "var(--color-status-danger-readable)"
        : "var(--color-icon-default)"};
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};

  svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;

/** Entry mode as a statusDot plus meta label. */
export const StyledEntryModeChip = styled.span<{ pomodoro: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);

  ${typeStyle("meta")};
  text-transform: none;
  letter-spacing: normal;
  color: var(--color-text-secondary-readable);

  &::before {
    content: "";
    width: var(--component-status-dot-size);
    height: var(--component-status-dot-size);
    border-radius: var(--component-status-dot-radius);
    background-color: ${(p) =>
      p.pomodoro
        ? "var(--color-status-planning)"
        : "var(--color-status-completed)"};
  }
`;

export const StyledEntryForm = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) 16rem 16rem;
  gap: var(--space-3);
  align-items: end;

  padding: var(--component-card-padding);
  margin-bottom: var(--layout-dashboard-content-board-card-gap);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--shadow-floating);

  label {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }

  label > input,
  label > div {
    text-transform: none;
    letter-spacing: normal;
  }

  /* Row two: the mode toggle, then the actions. */
  label:nth-of-type(5) {
    grid-column: 1 / 3;
  }

  .form-footer {
    grid-column: 3 / -1;
    align-self: end;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }

  .form-buttons {
    display: flex;
    gap: var(--space-2);

    button {
      width: auto;
    }
  }

  .form-error {
    ${typeStyle("meta")};
    color: var(--color-status-danger-readable);
  }
`;

// Not an extension of StyledInput: its attrs pin type="text".
export const StyledEntryTimeInput = styled.input.attrs(() => ({
  type: "time",
}))`
  width: 100%;
  height: var(--component-input-height);
  padding: 0 var(--space-3);

  ${typeStyle("body")};
  font-variant-numeric: tabular-nums;
  color: var(--component-input-text);
  color-scheme: light dark;

  border-radius: var(--component-input-radius);
  border: var(--border-width-hairline) solid
    var(--component-input-border);
  background-color: var(--component-input-bg);

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 var(--border-width-hairline)
      var(--color-border-focus);
  }
`;

/** Segmented outlined pill for the entry mode. */
export const StyledModeToggle = styled.div`
  display: inline-flex;
  height: var(--component-input-height);
  padding: var(--space-1);
  gap: var(--space-1);

  border-radius: var(--radius-pill);
  border: var(--border-width-hairline) solid var(--color-border-strong);

  button {
    padding: 0 var(--space-4);
    border: none;
    border-radius: var(--radius-pill);
    background: transparent;
    ${typeStyle("tag")};
    color: var(--color-text-primary);
    cursor: pointer;
    transition: ${themes.transition};

    &:hover {
      background-color: var(--color-background-surface-sunken);
    }

    ${focusRing};

    &[aria-pressed="true"] {
      color: var(--component-button-primary-text);
      background-color: var(--component-button-primary-bg);
    }
  }
`;
