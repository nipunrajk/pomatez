import { css, keyframes } from "styled-components/macro";

/**
 * Accessible variants of spec colors that fall below WCAG 4.5:1 for small
 * text on the cream backgrounds. Same hue and saturation, lightness lowered
 * until they pass against the darkest background they sit on. The original
 * tokens are still used for large text, strokes and fills.
 */
const modulaReadable = css`
  --color-text-secondary-readable: #69695f;
  --color-text-placeholder-readable: #6c6c63;
  --color-text-tertiary-readable: #696963;
  --color-text-sidebar-inactive-readable: #92a9bf;
  --color-brand-primary-readable: #4572a5;
  --color-timer-focus-readable: #4572a5;
  --color-timer-short-break-readable: #377d4f;
  --color-timer-long-break-readable: #a25e47;
  --color-status-danger-readable: #a25e47;
  --color-status-completed-readable: #377d4f;
  /* Ticks and numbers on the Pomodoro dial, which is filled with the
     readable timer color. */
  --color-timer-dial-text: var(--color-timer-gauge-ticks);
`;

/**
 * Modula (light, default). Token values come from tokens.generated.ts;
 * this block maps the app's existing semantic variables onto them.
 */
export const modulaTheme = css`
  ${modulaReadable}

  --color-primary: var(--color-brand-primary);
  --color-primary-rgb: var(--color-brand-primary-rgb);

  --color-yellow: var(--color-timer-long-break);
  --color-yellow-rgb: var(--color-timer-long-break-rgb);

  --color-green: var(--color-timer-short-break);
  --color-green-rgb: var(--color-timer-short-break-rgb);

  --color-pink: var(--color-status-danger);
  --color-pink-rgb: var(--color-status-danger-rgb);

  --color-heading-text: var(--color-text-primary);
  --color-body-text: var(--color-text-primary);
  --color-disabled-text: var(--color-text-tertiary);

  --color-bg-primary: var(--color-background-window);
  --color-bg-primary-rgb: var(--color-background-window-rgb);
  --color-bg-secondary: var(--color-background-surface);
  --color-bg-tertiary: var(--color-background-surface-sunken);

  --color-bg-popper: var(--color-background-surface);
  --color-bg-code: var(--color-background-surface-sunken);

  --color-bg-ripple-primary: var(--color-brand-primary-muted);
  --color-bg-ripple-green: rgba(var(--color-green-rgb), 0.16);
  --color-bg-ripple-yellow: rgba(var(--color-yellow-rgb), 0.16);

  --color-bg-input: var(--color-background-input);
  --color-bg-input-focus: var(--color-background-surface);

  --color-primary-button: var(--color-text-on-primary);
  --color-bg-button-normal: transparent;

  --color-bg-task-list: var(--color-background-surface-sunken);
  --color-bg-task-card: var(--color-background-surface);
  --color-bg-task-card-hover: var(--color-background-surface);
  --color-bg-task-card-focus: var(--color-background-surface);

  --color-titlebar-hover: rgba(var(--color-text-primary-rgb), 0.06);

  --color-bg-slider-thumb: var(--color-background-surface);

  --color-border-primary: var(--color-border-soft);
  --color-border-secondary: var(--color-border-soft);
  --color-border-progress: var(--color-timer-ring-track);
  --color-border-window: var(--color-border-soft);

  --color-border-input-primary: var(--color-border-input);
  --color-border-input-secondary: var(--color-border-input);

  --color-shadow-primary: rgba(var(--color-text-primary-rgb), 0.1);
`;

/**
 * Dark: the app's existing dark palette, plus dark values for the Modula
 * token names so restyled components render correctly in dark mode too.
 * Non-color tokens (type, spacing, radius, motion) are shared with light.
 */
export const darkTheme = css`
  --color-primary: #0098f7;
  --color-primary-rgb: 0, 152, 247;

  --color-yellow: #d48d0a;
  --color-yellow-rgb: 212, 141, 10;

  --color-green: #07b583;
  --color-green-rgb: 7, 181, 131;

  --color-pink: #e35676;
  --color-pink-rgb: 227, 86, 118;

  --color-heading-text: #e3e4e5;
  --color-body-text: #a7abae;
  --color-disabled-text: #7b8185;

  --color-bg-primary: #111d25;
  --color-bg-primary-rgb: 17, 29, 37;

  --color-bg-secondary: #1c2830;
  --color-bg-tertiary: #202c34;

  --color-bg-popper: #323e46;

  --color-bg-code: var(--color-bg-primary);

  --color-bg-ripple-primary: rgba(var(--color-primary-rgb), 0.24);
  --color-bg-ripple-green: rgba(var(--color-green-rgb), 0.24);
  --color-bg-ripple-yellow: rgba(var(--color-yellow-rgb), 0.24);

  --color-bg-input: #2a363e;
  --color-bg-input-focus: #2a363e;

  --color-primary-button: #fff;
  --color-bg-button-normal: #2a363e;

  --color-bg-task-list: var(--color-bg-secondary);
  --color-bg-task-card: #2a363e;
  --color-bg-task-card-hover: #2f3b43;
  --color-bg-task-card-focus: #323e46;

  --color-titlebar-hover: rgba(255, 255, 255, 0.08);

  --color-bg-slider-thumb: var(--color-bg-tertiary);

  --color-border-primary: rgba(255, 255, 255, 0.12);
  --color-border-secondary: rgba(255, 255, 255, 0.04);
  --color-border-progress: rgba(var(--color-primary-rgb), 0.16);
  --color-border-window: #283138;

  --color-border-input-primary: transparent;
  --color-border-input-secondary: transparent;

  --color-shadow-primary: rgba(0, 0, 0, 0.24);

  /* Modula token names, dark values */
  --color-brand-primary: var(--color-primary);
  --color-brand-primary-rgb: var(--color-primary-rgb);
  --color-brand-primary-hover: #1fa6f8;
  --color-brand-primary-active: #0086d9;
  --color-brand-primary-dark: #0b141a;
  --color-brand-primary-muted: rgba(var(--color-primary-rgb), 0.16);

  --color-background-window: var(--color-bg-primary);
  --color-background-window-rgb: var(--color-bg-primary-rgb);
  --color-background-surface: var(--color-bg-secondary);
  --color-background-surface-sunken: var(--color-bg-tertiary);
  --color-background-input: var(--color-bg-input);
  --color-background-kbd: #323e46;
  --color-background-sidebar: #0b141a;
  --color-background-sidebar-card: var(--color-primary);
  --color-background-overlay: rgba(0, 0, 0, 0.4);

  --color-text-heading: var(--color-heading-text);
  --color-text-primary: var(--color-heading-text);
  --color-text-primary-rgb: 227, 228, 229;
  --color-text-secondary: var(--color-body-text);
  --color-text-tertiary: var(--color-disabled-text);
  --color-text-placeholder: var(--color-disabled-text);
  --color-text-on-primary: #fff;
  --color-text-sidebar-active: #fff;
  --color-text-sidebar-inactive: #8a9aa8;

  --color-icon-default: var(--color-heading-text);
  --color-icon-muted: var(--color-body-text);
  --color-icon-active: var(--color-primary);
  --color-icon-on-sidebar: #7b8185;
  --color-icon-on-sidebar-active: #fff;

  --color-border-strong: rgba(255, 255, 255, 0.28);
  --color-border-soft: rgba(255, 255, 255, 0.08);
  --color-border-header: rgba(255, 255, 255, 0.12);
  --color-border-input: rgba(255, 255, 255, 0.08);
  --color-border-sidebar-active: rgba(255, 255, 255, 0.72);
  --color-border-focus: var(--color-primary);

  --color-status-completed: var(--color-green);
  --color-status-danger: var(--color-pink);
  --color-status-danger-rgb: var(--color-pink-rgb);
  --color-status-notification: var(--color-pink);

  --color-progress-track: rgba(255, 255, 255, 0.08);
  --color-progress-fill-success: var(--color-green);
  --color-progress-fill-primary: var(--color-primary);

  --color-timer-focus: var(--color-primary);
  --color-timer-short-break: var(--color-green);
  --color-timer-short-break-rgb: var(--color-green-rgb);
  --color-timer-long-break: var(--color-yellow);
  --color-timer-long-break-rgb: var(--color-yellow-rgb);
  --color-timer-ring-track: rgba(255, 255, 255, 0.08);

  /* The existing dark palette already clears 4.5:1 on its backgrounds. */
  --color-text-secondary-readable: var(--color-body-text);
  --color-text-placeholder-readable: var(--color-body-text);
  --color-text-tertiary-readable: var(--color-body-text);
  --color-text-sidebar-inactive-readable: #9aabb9;
  --color-brand-primary-readable: var(--color-primary);
  --color-timer-focus-readable: var(--color-primary);
  --color-timer-short-break-readable: var(--color-green);
  --color-timer-long-break-readable: var(--color-yellow);
  --color-status-danger-readable: var(--color-pink);
  --color-status-completed-readable: var(--color-green);

  /* #0098f7 is 3.1:1 under white text; deeper fill for text-on-blue. */
  --component-button-primary-bg: #0079c5;
  --component-button-primary-hover-bg: #006db1;
  --component-card-highlighted-bg: #0079c5;
  --color-calendar-selected-bg: #0079c5;
  --color-calendar-day: var(--color-body-text);
  --color-agenda-blue-bg: #0079c5;
  --color-agenda-grey-bg: var(--color-bg-tertiary);
  --color-agenda-grey-text: var(--color-heading-text);
  /* Dark timer colors are bright, so the dial's ticks and numbers go dark. */
  --color-timer-dial-text: var(--color-bg-primary);
  /* Calendar events: each pair swapped, deep fill with the light tint. */
  --color-calendar-event-blue-bg: #1f4a78;
  --color-calendar-event-blue-text: #f4f1ea;
  --color-calendar-event-sand-bg: #5c4430;
  --color-calendar-event-sand-text: #f2e3d0;
  --color-calendar-event-sage-bg: #384c37;
  --color-calendar-event-sage-text: #dee8dd;
  --color-calendar-event-mint-bg: #1e4e42;
  --color-calendar-event-mint-text: #a8e0d2;
  --color-calendar-event-terracotta-bg: #6e3326;
  --color-calendar-event-terracotta-text: #f6d9d2;
`;

const enterFromLeft = keyframes`
    0% {
      opacity: 0;
      transform: translateX(-2rem);
    }

    100% {
      opacity: 1;
      transform: translateX(0);
    }
`;

const enterFromRight = keyframes`
    0% {
      opacity: 0;
      transform: translateX(2rem);
    }

    100% {
      opacity: 1;
      transform: translateX(0);
    }
`;

export const themes = {
  color: {
    close: "var(--color-status-danger)",
  },
  easing: "var(--motion-easing-standard)",
  transition:
    "all var(--motion-duration-fast) var(--motion-easing-standard)",
  enterFromLeft,
  enterFromRight,
};
