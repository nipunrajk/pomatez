import { css } from "styled-components/macro";
import { TimerStatus } from "store/timer/types";

export const StyledScrollbar = css`
  &:hover::-webkit-scrollbar {
    width: 0.6rem;
  }

  &:hover::-webkit-scrollbar-thumb {
    background-color: var(--color-disabled-text);
  }

  &:hover::-webkit-scrollbar-track {
    background-color: var(--color-bg-tertiary);
  }

  &::-webkit-scrollbar {
    width: 0.6rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

export type TypeRole =
  | "hud-title"
  | "hud-timer"
  | "hud-timer-compact"
  | "hud-meta"
  | "timer-display"
  | "timer-unit"
  | "page-title"
  | "section-title"
  | "card-title"
  | "list-title"
  | "board-title"
  | "settings-heading"
  | "brand"
  | "body"
  | "nav-item"
  | "button"
  | "meta"
  | "eyebrow"
  | "tag"
  | "kbd";

/** Applies a Modula `typography.scale` role from the generated tokens. */
export const typeStyle = (role: TypeRole) => css`
  font-family: var(--type-${role}-family);
  font-size: var(--type-${role}-size);
  font-weight: var(--type-${role}-weight);
  line-height: var(--type-${role}-line-height);
  letter-spacing: var(--type-${role}-letter-spacing);
  text-transform: var(--type-${role}-transform);
`;

/**
 * Timer-state color from `color.timer`: focus is blue, short break green,
 * long (and special) break terracotta. `readable` picks the darker variant
 * that clears 4.5:1 for text; strokes and fills use the spec color.
 */
export const timerColor = (type?: TimerStatus, readable = false) => {
  const suffix = readable ? "-readable" : "";
  switch (type) {
    case TimerStatus.SHORT_BREAK:
      return `var(--color-timer-short-break${suffix})`;
    case TimerStatus.LONG_BREAK:
    case TimerStatus.SPECIAL_BREAK:
      return `var(--color-timer-long-break${suffix})`;
    default:
      return `var(--color-timer-focus${suffix})`;
  }
};

/** Keyboard focus ring shared by interactive controls. */
export const focusRing = css`
  &:focus-visible {
    outline: var(--border-width-thick) solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;
