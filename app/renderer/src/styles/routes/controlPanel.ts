import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, focusRing, typeStyle } from "styles/mixins";

export const StyledControlPanel = styled.main`
  flex: 1 1;
  min-height: 0;
  width: 100%;

  /* The page itself doesn't scroll: the board shrinks (and scrolls)
     only when space runs out, and milestones fill the rest. Top padding
     matches the compact right rail so both headers align. */
  padding: var(--space-4) var(--space-5);

  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow: hidden;

  animation: 240ms ${themes.enterFromRight} ease;
`;

/** `$fill`: takes the height left over (Project Milestones). */
export const StyledCPSection = styled.section<{ $fill?: boolean }>`
  /* The board takes its natural height up to ~58% of the page and
     scrolls inside beyond that; the $fill section (milestones) gets the
     rest, so both stay on screen without the page scrolling. */
  flex: ${(p) => (p.$fill ? "1 1 0" : "0 1 auto")};
  min-height: ${(p) => (p.$fill ? "14rem" : "16rem")};
  max-height: ${(p) => (p.$fill ? "none" : "58%")};

  display: flex;
  flex-direction: column;
`;

/**
 * components.sectionHeader: title + eyebrow subtitle on the left, actions
 * on the right; the actions wrap under the title when there's no room.
 */
export const StyledCPSectionHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  column-gap: var(--space-4);
  row-gap: var(--space-3);

  padding-bottom: var(--space-2);
  border-bottom: var(--component-section-header-divider-width) solid
    var(--component-section-header-divider);

  /* The subtitle wraps before the actions do, so the header stays one
     row tall at 1200px. */
  & > div:first-child {
    flex: 1 1 18rem;
    min-width: 0;
    /* Title stays level with the rail's when the actions stack taller. */
    align-self: flex-start;
  }

  /* The right-hand item stays right-aligned when it wraps. */
  & > :last-child:not(:first-child) {
    margin-left: auto;
  }

  h3 {
    ${typeStyle("section-title")};
    /* Compact: keeps the Workspace on one screen. */
    font-size: 2.4rem;
    color: var(--color-text-heading);
  }

  p {
    margin-top: var(--space-1);
    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }
`;

/** Ghost text action ("See all", "See everything"). */
export const StyledCPLink = styled.button`
  padding: var(--space-1) 0;

  display: inline-flex;
  align-items: center;
  gap: var(--space-1);

  ${typeStyle("button")};
  color: var(--color-brand-primary-readable);

  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;

/** Progress, %, Create card, See all: right-aligned, wrapping if needed. */
export const StyledCPHeaderControls = styled.div`
  flex: 1 1 auto;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2) var(--space-3);

  /* 60–140px: wraps on its 60px basis, so it shrinks before the button
     drops to a second row. */
  & > div:first-child {
    flex: 1 1 6rem;
    max-width: 14rem;
  }

  & > span {
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }

  & > button:not(${StyledCPLink}) {
    width: auto;
    height: var(--component-button-height-sm);
  }
`;

/* ---------- Project Board ---------- */

/** Fixed-width columns; the board scrolls sideways like Task List. */
export const StyledBoard = styled.div`
  display: flex;
  gap: var(--layout-dashboard-content-board-column-gap);

  /* Room for the lifted card's tilt and shadow inside the scroller. */
  margin: 0 calc(var(--space-2) * -1);
  padding: var(--space-3) var(--space-2) var(--space-3);

  /* One scroll area for the whole board (the drag library supports a
     single scroll parent per column). */
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
  ${StyledScrollbar};
`;

export const StyledBoardColumn = styled.div`
  flex: 0 0 26rem;
  width: 26rem;

  display: flex;
  flex-direction: column;
  gap: var(--layout-dashboard-content-board-card-gap);
`;

export const StyledBoardColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);

  h4 {
    ${typeStyle("body")};
    font-size: 1.4rem;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  & > button {
    margin-left: auto;
  }
`;

/** components.statusDot */
export const StyledStatusDot = styled.span<{ color: string }>`
  flex-shrink: 0;
  width: var(--component-status-dot-size);
  height: var(--component-status-dot-size);

  border-radius: var(--component-status-dot-radius);
  background-color: ${(p) => p.color};
`;

/** components.countPill */
export const StyledCountPill = styled.span`
  height: var(--component-count-pill-height);
  padding: 0 var(--component-count-pill-padding-x);

  display: inline-flex;
  align-items: center;

  ${typeStyle("meta")};
  font-variant-numeric: tabular-nums;
  /* countPill.text (#A7A7A2) is 2.1:1 on its fill; readable variant. */
  color: var(--color-text-tertiary-readable);

  border-radius: var(--component-count-pill-radius);
  background-color: var(--component-count-pill-bg);
`;

const ROUND_SIZE = {
  sm: "var(--component-button-height-sm)",
  md: "var(--component-button-icon-size)",
};

/** Outlined circular icon button (column "+", row arrow, dial -/+). */
export const StyledRoundButton = styled.button<{
  size?: "sm" | "md";
}>`
  flex-shrink: 0;
  width: ${(p) => ROUND_SIZE[p.size || "md"]};
  height: ${(p) => ROUND_SIZE[p.size || "md"]};

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-icon-default);
  border-radius: var(--component-button-icon-radius);
  border: var(--border-width-hairline) solid
    var(--component-button-icon-border);
  background-color: var(--component-button-icon-bg);
  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
    transition: transform var(--motion-duration-base)
      var(--motion-easing-standard);
  }

  &[aria-expanded="true"] > svg {
    transform: rotate(90deg);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;

    &:hover {
      background-color: var(--component-button-icon-bg);
    }
  }
`;

/**
 * A column's drop zone. Cards are spaced with margins, not gap, because
 * react-beautiful-dnd measures margins when placing a dropped card.
 */
export const StyledBoardCards = styled.div<{ isOver: boolean }>`
  flex: 1 1;
  min-height: 8rem;
  padding: var(--space-1);
  margin: calc(var(--space-1) * -1);

  border-radius: var(--component-card-radius);
  background-color: ${(p) =>
    p.isOver ? "var(--color-brand-primary-muted)" : "transparent"};
  transition: background-color var(--motion-duration-base)
    var(--motion-easing-standard);
`;

/** components.card; while dragged it takes components.card.highlighted. */
export const StyledBoardCard = styled.article<{ lifted?: boolean }>`
  /* Compact density so the board fits beside the milestones. */
  margin-bottom: var(--space-2);
  padding: 1rem var(--space-3);

  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  color: var(--color-text-primary);
  border-radius: 1rem;
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);
  cursor: grab;

  transition: box-shadow var(--motion-duration-base)
      var(--motion-easing-standard),
    rotate var(--motion-duration-base) var(--motion-easing-emphasized);

  &:hover {
    box-shadow: var(--shadow-card-hover);
  }

  ${focusRing};

  h5 {
    ${typeStyle("body")};
    font-size: 1.4rem;
    line-height: 1.3;
    font-weight: var(--font-weight-semibold);
    color: inherit;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* The card's document, previewed. */
  p {
    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-line;
  }

  ${(p) =>
    p.lifted &&
    css`
      cursor: grabbing;
      color: var(--component-card-highlighted-text);
      background-color: var(--component-card-highlighted-bg);
      /* motion.dragTilt as the rotate property: the drag library owns
         transform for positioning, and rotate composes with it. */
      rotate: -4deg;

      &,
      &:hover {
        box-shadow: var(--component-card-highlighted-shadow);
      }

      p {
        color: var(--component-card-highlighted-text);
      }
    `}
`;

export const StyledBoardEyebrow = styled.div<{ lifted?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-2);

  ${typeStyle("eyebrow")};
  font-size: 1.1rem;
  color: ${(p) =>
    p.lifted
      ? "var(--component-card-highlighted-text)"
      : "var(--color-text-secondary-readable)"};
`;

export const StyledTagRow = styled.div<{ lifted?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);

  & > span {
    height: 2.2rem;
    padding: 0 var(--space-2);
  }

  ${(p) =>
    p.lifted &&
    css`
      & > span {
        color: var(--component-card-highlighted-text);
        border-color: var(--component-card-highlighted-tag-border);
      }
    `}
`;

export const StyledBoardFooter = styled.div<{
  lifted?: boolean;
  warn?: boolean;
}>`
  min-height: 2.8rem;

  display: flex;
  align-items: center;
  gap: var(--space-3);

  ${typeStyle("meta")};
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.lifted
      ? "var(--component-card-highlighted-text)"
      : "var(--color-text-secondary-readable)"};

  & > span {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  /* Due today or overdue (not on completed cards). */
  .due {
    color: ${(p) =>
      p.warn && !p.lifted
        ? "var(--color-warning-text-readable)"
        : "inherit"};
    font-weight: ${(p) =>
      p.warn ? "var(--font-weight-semibold)" : "inherit"};
  }

  svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

const PRIORITY_COLOR = {
  high: "var(--color-warning-text-readable)",
  medium: "var(--color-brand-primary-readable)",
  low: "var(--color-text-secondary-readable)",
};

/** components.tag in the priority's color. */
export const StyledPriorityTag = styled.span<{
  level: "low" | "medium" | "high";
}>`
  display: inline-flex;
  align-items: center;
  height: var(--component-tag-height);
  padding: 0 var(--component-tag-padding-x);

  ${typeStyle("tag")};
  color: ${(p) => PRIORITY_COLOR[p.level]};
  border-radius: var(--component-tag-radius);
  border: var(--border-width-hairline) solid currentColor;
`;

/** "Focus on this card": quiet until the card is hovered or focused. */
export const StyledCardFocus = styled.button`
  flex-shrink: 0;
  margin-left: auto;

  width: 2.8rem;
  height: 2.8rem;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-icon-muted);
  border: var(--border-width-hairline) solid transparent;
  border-radius: var(--radius-circle);
  background-color: transparent;
  cursor: pointer;

  transition: ${themes.transition};

  article:hover &,
  article:focus-within &,
  &:focus-visible {
    color: var(--color-brand-primary-readable);
    border-color: var(--color-border-strong);
  }

  &:hover {
    background-color: var(--color-brand-primary-muted);
  }

  &[aria-pressed="true"] {
    color: var(--color-text-on-primary);
    border-color: transparent;
    background-color: var(--component-button-primary-bg);
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;

/* ---------- Card dialog ---------- */

/** Native modal dialog (focus trap, Esc, focus return come built in). */
export const StyledCardDialog = styled.dialog`
  width: min(56rem, calc(100vw - 4rem));
  max-height: calc(100vh - 4rem);
  margin: auto;
  padding: var(--space-6);

  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-xl);
  background-color: var(--color-background-window);
  box-shadow: var(--shadow-floating);

  overflow: hidden auto;
  ${StyledScrollbar};

  &::backdrop {
    background-color: var(--color-background-overlay);
  }

  &[open] {
    animation: cardDialogIn var(--motion-duration-base)
      var(--motion-easing-standard);
  }

  @keyframes cardDialogIn {
    from {
      opacity: 0;
      transform: translateY(var(--space-2));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &[open] {
      animation: none;
    }
  }
`;

export const StyledCardForm = styled.form`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);

  h2 {
    grid-column: 1 / -1;
    padding-bottom: var(--component-section-header-padding-bottom);
    border-bottom: var(--component-section-header-divider-width) solid
      var(--component-section-header-divider);

    ${typeStyle("section-title")};
    color: var(--color-text-heading);
  }

  label {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }

  label > input,
  label > textarea,
  label > div {
    ${typeStyle("body")};
    text-transform: none;
    letter-spacing: normal;
  }

  .wide {
    grid-column: 1 / -1;
  }

  /* Two fields sharing one grid cell (Project, then its custom category). */
  .field-stack {
    display: grid;
    gap: var(--space-3);
    align-content: start;
  }

  .form-error {
    ${typeStyle("meta")};
    text-transform: none;
    letter-spacing: normal;
    color: var(--color-status-danger-readable);
  }

  .form-footer {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-2);

    button {
      width: auto;
    }
  }

  .form-buttons {
    display: flex;
    gap: var(--space-2);
    margin-left: auto;
  }
`;

// Not extensions of StyledInput: its attrs pin type="text".
export const StyledNumberInput = styled.input.attrs(() => ({
  type: "number",
  inputMode: "numeric",
}))`
  width: 100%;
  height: var(--component-input-height);
  padding: 0 var(--component-input-padding-x);

  font-variant-numeric: tabular-nums;
  color: var(--component-input-text);

  border-radius: var(--component-input-radius);
  border: var(--border-width-hairline) solid
    var(--component-input-border);
  background-color: var(--component-input-bg);

  &::placeholder {
    color: var(--color-text-placeholder-readable);
  }

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 var(--border-width-hairline)
      var(--color-border-focus);
  }
`;

export const StyledDateInput = styled.input.attrs(() => ({
  type: "date",
}))`
  width: 100%;
  height: var(--component-input-height);
  padding: 0 var(--component-input-padding-x);

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

/* ---------- Project Milestones ---------- */

/** Scrolls on its own when there are more milestones than fit. */
export const StyledMilestones = styled.ul`
  flex: 1 1 auto;
  min-height: 0;
  margin: var(--space-2) calc(var(--space-1) * -1) 0;
  padding: var(--space-1);
  overflow-y: auto;
  ${StyledScrollbar};

  list-style: none;
  display: grid;
  align-content: start;
  gap: var(--space-2);
`;

/** One milestone: title row, badges, progress + deadline, then subtasks. */
export const StyledMilestoneRow = styled.li<{ open: boolean }>`
  padding: 1rem 1.4rem;

  display: grid;
  gap: var(--space-2);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: ${(p) =>
    p.open
      ? "var(--shadow-card-hover)"
      : "var(--component-card-shadow)"};
  cursor: pointer;

  transition: transform var(--motion-duration-fast)
      var(--motion-easing-standard),
    box-shadow var(--motion-duration-base) var(--motion-easing-standard);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-card-hover);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }

  .milestone-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);

    & > button {
      width: 2.8rem;
      height: 2.8rem;
    }

    h4 {
      flex: 1 1;
      min-width: 0;
    }

    h4 > button {
      padding: 0;

      ${typeStyle("body")};
      font-size: 1.5rem;
      font-weight: var(--font-weight-semibold);
      text-align: left;
      color: var(--color-text-primary);
      overflow-wrap: anywhere;

      border: none;
      background: none;
      cursor: pointer;

      ${focusRing};
    }
  }

  .milestone-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);

    p {
      margin-left: auto;
      ${typeStyle("meta")};
      font-size: 1.1rem;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-secondary-readable);
    }
  }

  .milestone-progress {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);

    & > div {
      flex: 1 1 12rem;
    }

    .percent {
      ${typeStyle("meta")};
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary);
    }
  }

  .milestone-panel {
    padding-top: var(--space-2);
    border-top: var(--border-width-hairline) solid
      var(--color-border-soft);
    cursor: auto;
  }

  .milestone-hours {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-bottom: var(--space-2);

    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary-readable);

    svg {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
    }
  }
`;

const STATUS_TONE = {
  ongoing: css`
    color: var(--color-status-completed-readable);
    /* Light tint: at 12% the green text drops below 4.5:1. */
    background-color: rgba(var(--color-status-completed-rgb), 0.06);
  `,
  review: css`
    color: var(--color-warning-text-readable);
    background-color: rgba(var(--color-status-planning-rgb), 0.14);
  `,
  paused: css`
    color: var(--color-text-secondary-readable);
    background-color: var(--color-background-surface-sunken);
  `,
};

/** components.tag, tinted by milestone status. */
export const StyledStatusTag = styled.span<{
  status: "ongoing" | "review" | "paused";
}>`
  display: inline-flex;
  align-items: center;
  height: 2.2rem;
  padding: 0 var(--space-2);

  ${typeStyle("tag")};
  border-radius: var(--component-tag-radius);
  border: var(--border-width-hairline) solid currentColor;
  ${(p) => STATUS_TONE[p.status]};
`;

/** Terracotta when due within 3 days or past due. */
export const StyledMilestoneDeadline = styled.span<{ soon: boolean }>`
  margin-left: auto;

  ${typeStyle("tag")};
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.soon
      ? "var(--color-warning-text-readable)"
      : "var(--color-text-secondary-readable)"};
`;

export const StyledSubtaskList = styled.ul`
  list-style: none;
`;

export const StyledSubtask = styled.li<{ done: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.6rem 0;

  & + & {
    border-top: var(--border-width-hairline) solid
      var(--color-border-soft);
  }

  & > label {
    flex: 1 1;
    min-width: 0;
    color: ${(p) =>
      p.done
        ? "var(--color-text-secondary-readable)"
        : "var(--color-text-primary)"};
    text-decoration: ${(p) => (p.done ? "line-through" : "none")};
    overflow-wrap: anywhere;
  }

  /* Row buttons are always visible here (no card hover to reveal them). */
  & > button {
    color: var(--color-brand-primary-readable);
    border-color: var(--color-border-strong);
  }

  /* "On board": the subtask is on the Task Board; jumps to its card. */
  & > .on-board {
    flex-shrink: 0;
    height: var(--component-button-height-sm);
    padding: 0 var(--space-2);

    display: inline-flex;
    align-items: center;
    gap: var(--space-1);

    ${typeStyle("tag")};
    color: var(--color-status-completed-readable);
    border: var(--border-width-hairline) solid currentColor;
    border-radius: var(--radius-pill);
    background: none;
    cursor: pointer;

    &:hover {
      background-color: var(--color-background-surface-sunken);
    }

    ${focusRing};

    svg {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
    }
  }
`;

/** Brief confirmation ("Added to Task Board"), bottom-centre. */
export const StyledToast = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  z-index: 20;
  transform: translate(-50%, ${(p) => (p.visible ? "0" : "var(--space-2)")});

  padding: var(--space-2) var(--space-4);

  ${typeStyle("body")};
  color: var(--color-text-on-primary);
  border-radius: var(--radius-pill);
  background-color: var(--color-brand-primary-dark);
  box-shadow: var(--shadow-floating);
  pointer-events: none;

  opacity: ${(p) => (p.visible ? 1 : 0)};
  visibility: ${(p) => (p.visible ? "visible" : "hidden")};
  transition: opacity var(--motion-duration-base)
      var(--motion-easing-standard),
    transform var(--motion-duration-base) var(--motion-easing-standard),
    visibility var(--motion-duration-base);
`;

export const StyledCPEmpty = styled.p`
  padding: var(--space-5) 0;
  color: var(--color-text-secondary-readable);
`;

/* ---------- Right rail: calendar + agenda ---------- */

/** Takes the rail's leftover height so only the agenda list scrolls. */
export const StyledRailCalendar = styled.section`
  flex: 1 1;
  min-height: 0;

  display: flex;
  flex-direction: column;
`;

export const StyledCalendarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);

  h3 {
    flex: 1 1;
    ${typeStyle("card-title")};
    color: var(--color-text-heading);
  }
`;

export const StyledCalendarGrid = styled.div`
  /* Smaller days than the 48px token, for this one-week strip only. */
  --component-calendar-day-size: 3.2rem;

  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;

  & > abbr {
    padding-bottom: var(--space-1);
    ${typeStyle("eyebrow")};
    text-decoration: none;
    /* calendar.weekday (#9C9C90) is 2.6:1 on cream; readable variant. */
    color: var(--color-text-secondary-readable);
  }
`;

export const StyledCalendarDay = styled.button<{
  selected: boolean;
  today: boolean;
  hasEntries: boolean;
}>`
  position: relative;

  width: var(--component-calendar-day-size);
  height: var(--component-calendar-day-size);
  max-width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  ${typeStyle("body")};
  font-variant-numeric: tabular-nums;
  font-weight: ${(p) =>
    p.today
      ? "var(--font-weight-semibold)"
      : "var(--font-weight-regular)"};
  color: ${(p) =>
    p.selected
      ? "var(--color-calendar-selected-text)"
      : p.today
      ? "var(--color-brand-primary-readable)"
      : "var(--color-calendar-day)"};

  border: none;
  border-radius: var(--component-calendar-day-radius);
  background-color: ${(p) =>
    p.selected ? "var(--color-calendar-selected-bg)" : "transparent"};
  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    background-color: ${(p) =>
      p.selected
        ? "var(--color-calendar-selected-bg)"
        : "var(--color-background-surface-sunken)"};
  }

  ${focusRing};

  /* A dot under days that have time entries. */
  &::after {
    content: "";
    display: ${(p) => (p.hasEntries ? "block" : "none")};
    position: absolute;
    bottom: var(--space-1);
    left: 50%;
    transform: translateX(-50%);

    width: var(--space-1);
    height: var(--space-1);
    border-radius: var(--radius-circle);
    background-color: ${(p) =>
      p.selected
        ? "var(--color-calendar-selected-text)"
        : "var(--color-brand-primary)"};
  }
`;

export const StyledAgenda = styled.section`
  margin-top: var(--space-3);
  flex: 1 1;
  min-height: 0;

  display: flex;
  flex-direction: column;

  h3 {
    margin-bottom: var(--space-2);
    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }
`;

/** The part of the agenda that scrolls, so the rail itself never does. */
export const StyledAgendaScroll = styled.div`
  flex: 1 1;
  min-height: 0;
  overflow-y: auto;
  ${StyledScrollbar};

  ul {
    list-style: none;
    display: grid;
    align-content: start;
    gap: var(--space-2);
  }
`;

/** Time on the left, card on the right. */
export const StyledAgendaRow = styled.li`
  display: grid;
  grid-template-columns: 6.4rem minmax(0, 1fr);
  column-gap: var(--space-2);
  align-items: start;
`;

export const StyledAgendaTime = styled.span`
  padding-top: var(--space-1);

  ${typeStyle("meta")};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary-readable);
`;

/** components.agendaEvent: blue for Pomodoro entries, grey for stopwatch. */
export const StyledAgendaEvent = styled.div<{ pomodoro: boolean }>`
  padding: var(--space-1) var(--space-2);

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);

  border-radius: var(--component-agenda-event-radius);
  background-color: ${(p) =>
    p.pomodoro
      ? "var(--color-agenda-blue-bg)"
      : "var(--color-agenda-grey-bg)"};

  strong {
    ${typeStyle("body")};
    font-weight: var(--font-weight-semibold);
    color: ${(p) =>
      p.pomodoro
        ? "var(--color-agenda-blue-text)"
        : "var(--color-agenda-grey-text)"};
    overflow-wrap: anywhere;
  }

  span {
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    /* agenda subtexts (70% white, #8C8C80) miss 4.5:1 at 12px. */
    color: ${(p) =>
      p.pomodoro
        ? "var(--color-agenda-blue-text)"
        : "var(--color-text-secondary-readable)"};
  }
`;

/** A Google Calendar event in its color theme; activating it offers focus. */
export const StyledAgendaCard = styled.button<{
  tone: "blue" | "sand" | "sage" | "mint" | "terracotta";
}>`
  width: 100%;
  padding: var(--space-1) var(--space-2);

  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  text-align: left;
  color: ${(p) => `var(--color-calendar-event-${p.tone}-text)`};
  border: none;
  border-radius: var(--component-agenda-event-radius);
  background-color: ${(p) =>
    `var(--color-calendar-event-${p.tone}-bg)`};
  cursor: pointer;

  transition: box-shadow var(--motion-duration-base)
    var(--motion-easing-standard);

  &:hover,
  &[aria-expanded="true"] {
    box-shadow: var(--shadow-card-hover);
  }

  ${focusRing};

  strong {
    ${typeStyle("body")};
    font-weight: var(--font-weight-semibold);
    overflow-wrap: anywhere;
  }

  span {
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
  }
`;

export const StyledAgendaConfirm = styled.div`
  margin-top: var(--space-1);

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-2);

  & > button {
    width: auto;
    height: var(--component-button-height-sm);
  }
`;

/** Account + sync state (connected), or the slim connect link. */
export const StyledAgendaMeta = styled.div`
  margin-bottom: var(--space-2);

  display: flex;
  align-items: center;
  gap: var(--space-2);

  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);

  & > span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & > button {
    margin-left: auto;
    flex-shrink: 0;
    ${typeStyle("meta")};
  }

  ${StyledAgendaScroll} & {
    margin: var(--space-2) 0 0;
  }
`;

/** Shown instead of the empty state until Google Calendar is connected. */
export const StyledConnectCard = styled.div`
  padding: var(--space-3);

  display: grid;
  gap: var(--space-2);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);

  & > div:first-child {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-brand-primary-readable);

    svg {
      width: var(--icon-size-md);
      height: var(--icon-size-md);
    }
  }

  h4 {
    ${typeStyle("body")};
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  p {
    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);
  }

  .connect-actions {
    display: flex;
    gap: var(--space-2);

    button {
      width: auto;
      height: var(--component-button-height-sm);
    }

    button:first-child {
      border-radius: var(--radius-pill);
    }
  }

  .connect-status:empty {
    display: none;
  }

  .connect-status {
    color: var(--color-status-danger-readable);
  }
`;

/* ---------- Right rail: Pomodoro dial ---------- */

export const StyledPomodoroDial = styled.section<{ accent: string }>`
  --dial-accent: ${(p) => p.accent};

  display: flex;
  flex-direction: column;

  /* Strict-mode refusal; space is reserved so the dial doesn't jump. */
  .dial-status {
    min-height: var(--space-5);
    padding-top: var(--space-1);

    ${typeStyle("meta")};
    text-align: center;
    color: var(--color-status-danger-readable);
  }
`;

/** components.sectionHeader with the round badge on the right. */
export const StyledDialHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  /* Same metrics as StyledCPSectionHeader (title + eyebrow subtitle), so
     the two headers and their rules line up across the page. */
  padding-bottom: var(--space-2);
  border-bottom: var(--component-section-header-divider-width) solid
    var(--component-section-header-divider);

  h3 {
    ${typeStyle("section-title")};
    /* Compact: keeps the Workspace on one screen. */
    font-size: 2.4rem;
    color: var(--color-text-heading);
  }

  p {
    margin-top: var(--space-1);
    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }
`;

/** Anchors the round popover under its badge. */
export const StyledRoundSetup = styled.div`
  position: relative;
  flex-shrink: 0;
`;

/** components.countPill, as a button that opens the round setup. */
export const StyledRoundBadge = styled.button`
  height: var(--component-count-pill-height);
  padding: 0 var(--component-count-pill-padding-x);

  display: inline-flex;
  align-items: center;

  ${typeStyle("meta")};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-tertiary-readable);

  border: var(--border-width-hairline) solid transparent;
  border-radius: var(--component-count-pill-radius);
  background-color: var(--component-count-pill-bg);
  cursor: pointer;

  transition: ${themes.transition};

  &:hover,
  &[aria-expanded="true"] {
    color: var(--color-text-primary);
    border-color: var(--color-border-strong);
  }

  ${focusRing};
`;

export const StyledRoundPopover = styled.div`
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 10;

  width: 28rem;
  padding: var(--space-2) var(--space-3) var(--space-3);

  display: grid;
  gap: var(--space-3);

  border-radius: var(--radius-lg);
  background-color: var(--color-background-surface);
  box-shadow: var(--shadow-floating);

  h4 {
    padding-bottom: var(--space-2);
    border-bottom: var(--border-width-hairline) solid
      var(--color-border-soft);

    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }
`;

/** Label, then [-] value [+]. */
export const StyledRoundStepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  & > span {
    ${typeStyle("body")};
    color: var(--color-text-primary);
    white-space: nowrap;
  }

  & > div {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  output {
    min-width: 2ch;
    text-align: center;
    ${typeStyle("body")};
    font-weight: var(--font-weight-semibold);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }
`;

export const StyledDialReadout = styled.div`
  margin: var(--space-3) 0 var(--space-2);

  display: grid;
  grid-template-columns: max-content 1fr max-content;
  align-items: center;
  justify-items: center;

  & > button {
    color: var(--dial-accent);
    border-color: var(--color-border-strong);

    & > svg {
      width: var(--icon-size-md);
      height: var(--icon-size-md);
    }
  }

  & > p {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--dial-accent);
  }

  strong {
    ${typeStyle("timer-display")};
    /* Smaller than the 80px token so the rail fits without scrolling. */
    font-size: 5rem;
    line-height: 1;
    font-variant-numeric: lining-nums tabular-nums;
  }

  span {
    ${typeStyle("timer-unit")};
  }
`;

const ACTION_SIZE = "3.6rem";

/** Reset, Start/Pause, Skip: between the readout and the dial. */
export const StyledDialActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);

  & > button {
    transition: transform var(--motion-duration-fast)
        var(--motion-easing-standard),
      background-color var(--motion-duration-fast)
        var(--motion-easing-standard);

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    @media (prefers-reduced-motion: reduce) {
      &:hover,
      &:active {
        transform: none;
      }
    }
  }

  & > button:first-child,
  & > button:last-child {
    width: ${ACTION_SIZE};
    height: ${ACTION_SIZE};
    color: var(--dial-accent);
    border-color: var(--dial-accent);
  }

  /* Solid pill in the phase color; text uses the dial's on-color. */
  & > button:nth-child(2) {
    height: ${ACTION_SIZE};
    padding: 0 var(--space-5);

    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    ${typeStyle("button")};
    color: var(--color-timer-dial-text);
    border: none;
    border-radius: var(--radius-pill);
    background-color: var(--dial-accent);
    box-shadow: var(--shadow-button);
    cursor: pointer;

    ${focusRing};

    & > svg {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
    }
  }
`;

/** The dial: the top of a disc, clipped flat with rounded bottom corners. */
export const StyledDialSvg = styled.svg`
  display: block;
  width: 100%;
  height: auto;
  max-height: 11rem;

  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  overflow: hidden;

  circle {
    fill: var(--dial-accent);
  }

  line {
    stroke: var(--color-timer-dial-text);
    stroke-linecap: round;
  }

  text {
    font-family: var(--font-display);
    font-size: 2.2rem;
    font-weight: var(--font-weight-semibold);
    font-variant-numeric: lining-nums;
    fill: var(--color-timer-dial-text);
  }

  g {
    transform-box: view-box;
    transition: transform var(--motion-duration-slow)
      var(--motion-easing-standard);
  }

  @media (prefers-reduced-motion: reduce) {
    g {
      transition: none;
    }
  }
`;
