import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, focusRing, typeStyle } from "styles/mixins";

export const StyledControlPanel = styled.main`
  flex: 1 1;
  min-height: 0;
  width: 100%;

  padding: var(--layout-dashboard-content-padding-y)
    var(--layout-dashboard-content-padding-x);

  overflow: hidden auto;
  ${StyledScrollbar};

  animation: 240ms ${themes.enterFromRight} ease;
`;

export const StyledCPSection = styled.section`
  & + & {
    margin-top: var(--layout-dashboard-content-section-gap);
  }
`;

/** components.sectionHeader: title + eyebrow subtitle over a hairline. */
export const StyledCPSectionHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr max-content;
  align-items: end;
  row-gap: var(--space-3);
  column-gap: var(--space-4);

  padding-bottom: var(--component-section-header-padding-bottom);
  border-bottom: var(--component-section-header-divider-width) solid
    var(--component-section-header-divider);

  h3 {
    ${typeStyle("section-title")};
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

  ${typeStyle("button")};
  color: var(--color-brand-primary-readable);

  border: none;
  background: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  ${focusRing};
`;

export const StyledCPProgressRow = styled.div`
  grid-column: 1 / -1;

  display: flex;
  align-items: center;
  gap: var(--space-3);

  & > div {
    flex: 1 1;
  }

  & > span {
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }

  & > button {
    width: auto;
  }
`;

/* ---------- Project Board ---------- */

/** Fixed-width columns; the board scrolls sideways like Task List. */
export const StyledBoard = styled.div`
  display: flex;
  gap: var(--layout-dashboard-content-board-column-gap);

  /* Room for the lifted card's tilt and shadow inside the scroller. */
  margin: 0 calc(var(--space-2) * -1);
  padding: var(--space-6) var(--space-2) var(--space-8);

  overflow-x: auto;
  overflow-y: hidden;
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
  lg: "var(--space-12)",
};

/** Outlined circular icon button (column "+", row arrow, dial -/+). */
export const StyledRoundButton = styled.button<{
  size?: "sm" | "md" | "lg";
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
  min-height: 12rem;
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
  margin-bottom: var(--layout-dashboard-content-board-card-gap);
  padding: var(--component-card-padding);

  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  color: var(--color-text-primary);
  border-radius: var(--component-card-radius);
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
  color: ${(p) =>
    p.lifted
      ? "var(--component-card-highlighted-text)"
      : "var(--color-text-secondary-readable)"};
`;

export const StyledTagRow = styled.div<{ lifted?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);

  ${(p) =>
    p.lifted &&
    css`
      & > span {
        color: var(--component-card-highlighted-text);
        border-color: var(--component-card-highlighted-tag-border);
      }
    `}
`;

export const StyledBoardFooter = styled.div<{ lifted?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-2);

  ${typeStyle("meta")};
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.lifted
      ? "var(--component-card-highlighted-text)"
      : "var(--color-text-secondary-readable)"};

  svg {
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

// Not an extension of StyledInput: its attrs pin type="text".
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

/* ---------- Task Breakdown ---------- */

export const StyledBreakdownRows = styled.ul`
  list-style: none;
`;

export const StyledBreakdownRowItem = styled.li`
  padding: var(--space-5) 0;
  border-bottom: var(--border-width-hairline) solid
    var(--color-border-soft);
`;

export const StyledTaskRow = styled.div`
  display: grid;
  grid-template-columns: 1fr max-content;
  column-gap: var(--space-4);
  row-gap: var(--space-2);
  align-items: center;

  h4 {
    ${typeStyle("body")};
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    overflow-wrap: anywhere;
  }
`;

export const StyledTaskRowMeta = styled.div`
  grid-column: 1 / -1;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-3);

  & > p {
    margin-left: auto;
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary-readable);
  }
`;

export const StyledTaskRowProgress = styled.div`
  grid-column: 1 / -1;

  display: flex;
  align-items: center;
  gap: var(--space-3);

  & > div {
    flex: 1 1;
  }

  & > span {
    min-width: 4ch;
    text-align: right;
    ${typeStyle("meta")};
    font-variant-numeric: tabular-nums;
    color: var(--color-text-primary);
  }
`;

export const StyledSubtaskList = styled.ul`
  list-style: none;
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-4);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);
`;

export const StyledSubtask = styled.li<{ done: boolean }>`
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) 0;

  color: ${(p) =>
    p.done
      ? "var(--color-text-secondary-readable)"
      : "var(--color-text-primary)"};
  text-decoration: ${(p) => (p.done ? "line-through" : "none")};
  overflow-wrap: anywhere;

  & + & {
    border-top: var(--border-width-hairline) solid
      var(--color-border-soft);
  }

  & > span:first-child {
    position: relative;
    top: -0.1em;
  }
`;

export const StyledCPEmpty = styled.p`
  padding: var(--space-5) 0;
  color: var(--color-text-secondary-readable);
`;

/* ---------- Right rail: calendar + agenda ---------- */

export const StyledRailCalendar = styled.section`
  margin-top: var(--space-4);
`;

export const StyledCalendarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);

  h3 {
    flex: 1 1;
    ${typeStyle("section-title")};
    color: var(--color-text-heading);
  }
`;

export const StyledCalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  justify-items: center;
  row-gap: var(--space-1);

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
  margin-top: var(--space-5);

  h3 {
    margin-bottom: var(--space-3);
    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }

  ul {
    list-style: none;
    display: grid;
    gap: var(--space-2);
  }
`;

/** components.agendaEvent: blue for Pomodoro entries, grey for stopwatch. */
export const StyledAgendaEvent = styled.li<{ pomodoro: boolean }>`
  min-height: var(--component-agenda-event-min-height);
  padding: var(--component-agenda-event-padding-y)
    var(--component-agenda-event-padding-x);

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

/* ---------- Right rail: Pomodoro dial ---------- */

export const StyledPomodoroDial = styled.section<{ accent: string }>`
  --dial-accent: ${(p) => p.accent};

  display: flex;
  flex-direction: column;
`;

/** components.sectionHeader with the on/off switch on the right. */
export const StyledDialHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  padding-bottom: var(--component-section-header-padding-bottom);
  border-bottom: var(--component-section-header-divider-width) solid
    var(--component-section-header-divider);

  label {
    ${typeStyle("section-title")};
    color: var(--color-text-heading);
    cursor: pointer;
  }
`;

export const StyledDialReadout = styled.div`
  margin: var(--space-8) 0 var(--space-6);

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
    font-variant-numeric: lining-nums tabular-nums;
  }

  span {
    ${typeStyle("timer-unit")};
  }
`;

/** The dial: the top of a disc, clipped flat with rounded bottom corners. */
export const StyledDialSvg = styled.svg`
  display: block;
  width: 100%;
  height: auto;

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
