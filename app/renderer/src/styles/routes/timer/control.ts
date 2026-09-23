import styled, { css } from "styled-components/macro";
import { TimerStatus } from "store/timer/types";
import { themes } from "../../themes";
import { focusRing, timerColor, typeStyle } from "styles/mixins";

const ControlButton = css`
  min-width: 3.2rem;
  min-height: 3.2rem;

  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-icon-default);

  border: none;
  border-radius: var(--radius-circle);
  background-color: transparent;

  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};
`;

/** Playback controls: outlined circles per layout.compact.controls. */
const OutlinedControl = css`
  ${ControlButton};

  width: var(--layout-compact-controls-secondary-size);
  height: var(--layout-compact-controls-secondary-size);
  border: var(--border-width-hairline) solid
    var(--layout-compact-controls-border);

  & > svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
  }
`;

type ControlProps = { type?: TimerStatus };

export const StyledControlSpacer = styled.div<ControlProps>`
  flex: 1 0;
`;

export const StyledControl = styled.div<ControlProps>`
  width: 100%;
  height: 9.2rem;

  padding: 0.8rem 1.2rem;

  display: flex;
  align-items: center;
  justify-content: center;
  grid-template-columns: 72px max-content 1fr;
  column-gap: 1rem;

  color: ${(p) => timerColor(p.type)};

  .ripple-hook {
    background-color: ${(p) =>
      (p.type === TimerStatus.SHORT_BREAK &&
        "var(--color-bg-ripple-green)") ||
      (p.type === TimerStatus.LONG_BREAK &&
        "var(--color-bg-ripple-yellow)") ||
      (p.type === TimerStatus.SPECIAL_BREAK &&
        "var(--color-bg-ripple-yellow)") ||
      "var(--color-bg-ripple-primary)"};
  }
`;

type SessionProps = { timerType?: TimerStatus };

export const StyledSessionReset = styled.button<SessionProps>`
  position: absolute;
  top: 0;
  right: 0;

  width: 2.4rem;
  height: 2.4rem;

  margin-top: -0.5rem;
  margin-right: -2rem;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: var(--radius-circle);
  background-color: var(--color-background-surface-sunken);

  opacity: 0;
  visibility: hidden;
  transform: translateY(1rem);
  transition: all 320ms ease;

  &:hover {
    color: ${(p) => timerColor(p.timerType, true)};
  }

  ${focusRing};

  & > svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

export const StyledSessions = styled.p`
  width: max-content;
  height: max-content;

  ${typeStyle("body")};
  font-weight: var(--font-weight-medium);
  font-variant-numeric: tabular-nums;

  display: flex;
  flex-direction: column;
  align-items: center;

  color: var(--color-text-primary);

  /* meta rather than eyebrow: the uppercase label overflows 340px. */
  & > span:nth-of-type(2) {
    ${typeStyle("meta")};
    color: var(--color-text-secondary-readable);
  }

  position: relative;

  &:hover ${StyledSessionReset} {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

export const StyledControlMain = styled.div`
  display: grid;
  align-items: center;
  align-content: center;
  grid-auto-flow: column;
  column-gap: var(--space-2);
`;

export const StyledResetButton = styled.button`
  ${OutlinedControl};
`;

export const StyledMainButton = styled.button`
  ${ControlButton};

  width: var(--layout-compact-controls-primary-size);
  height: var(--layout-compact-controls-primary-size);
  border: var(--border-width-hairline) solid
    var(--layout-compact-controls-border);
  border-radius: var(--radius-circle);
`;

export const StyledSkipButton = styled.button`
  ${OutlinedControl};
`;

export const StyledVolumeButton = styled.button`
  ${OutlinedControl};
`;

export const StyledStrictIndicator = styled.div<{ warn?: boolean }>`
  width: 2.8rem;
  height: 2.8rem;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-icon-default);
  background-color: transparent;

  border-radius: var(--radius-circle);
  border: var(--border-width-hairline) solid var(--color-border-strong);
  box-shadow: 0 0 0 0 rgba(var(--color-yellow-rgb), 0.16);

  position: relative;

  ${(p) =>
    p.warn &&
    css`
      animation: warning 1s ease;
    `}

  & > svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @keyframes warning {
    0% {
      color: var(--color-yellow);
      border-color: var(--color-yellow);
      box-shadow: 0 0 0 0 rgba(var(--color-yellow-rgb), 0.24);
    }
    50% {
      color: var(--color-yellow);
      border-color: var(--color-yellow);
      box-shadow: 0 0 0 12px rgba(var(--color-yellow-rgb), 0);
    }
    100% {
      color: var(--color-icon-default);
      border-color: var(--color-border-strong);
      box-shadow: 0 0 0 0 rgba(var(--color-yellow-rgb), 0);
    }
  }
`;

export const StyledStrictSnackbar = styled.div<{ warn?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;

  margin-top: -57%;
  margin-right: 6.8rem;

  width: 16rem;
  height: 5.6rem;

  padding: 0.7rem 1.2rem;

  text-align: center;

  ${typeStyle("meta")};
  color: var(--color-text-primary);

  border-radius: var(--radius-pill);
  border: none;
  background-color: var(--color-background-surface);
  box-shadow: var(--shadow-floating);
  transition: ${themes.transition};

  opacity: 0;
  visibility: hidden;
  transform: translateY(6rem);

  ${(p) =>
    p.warn &&
    css`
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    `}

  & > span {
    font-weight: 500;
    color: var(--color-yellow);
  }
`;
