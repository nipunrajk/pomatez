import styled, { css } from "styled-components/macro";
import { TimerStatus } from "store/timer/types";
import { ProgressSVG } from "assets/icons";
import { timerColor, typeStyle } from "styles/mixins";

export type ProgressProps = {
  offset: number;
  animate: "true" | "false";
  type?: TimerStatus;
};

export const StyledCounterProgress = styled(ProgressSVG)<ProgressProps>`
  #progress {
    stroke: ${(p) => timerColor(p.type)};
    /* In the ring's 220-unit viewBox; renders as the 6px ringStroke at 240px. */
    stroke-width: 5.5;
    stroke-linecap: round;
    stroke-dasharray: 674px;
    stroke-dashoffset: ${(p) => `${p.offset}px`};
    transition: ${(p) =>
      p.animate === "true" && "stroke-dashoffset 1s linear"};
  }
`;

export const StyledCounterWrapper = styled.div`
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0;
  left: 0;

  display: grid;
  align-content: center;
  justify-content: center;
  justify-items: center;

  margin-top: -0.8rem;
`;

type CounterContainerProps = {
  fullscreen?: boolean;
};

export const StyledCounterContainer = styled.div<CounterContainerProps>`
  width: 100%;

  flex: 1 1;

  padding: 2rem;

  background-color: var(--color-bg-primary);

  position: relative;

  ${(p) =>
    p.fullscreen &&
    css`
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      z-index: 1000 !important;

      &::before,
      ${StyledCounterProgress} {
        margin-top: -2.3rem !important;
      }

      ${StyledCounterWrapper} {
        margin-top: -3.1rem !important;
      }
    `}

  &::before,
  ${StyledCounterProgress} {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateY(-180deg) rotateZ(-90deg);

    width: var(--layout-compact-timer-ring-size);
    height: var(--layout-compact-timer-ring-size);
  }

  &::before {
    content: "";

    border-radius: var(--radius-circle);
    border: var(--layout-compact-timer-ring-stroke) solid
      var(--color-timer-ring-track);
  }
`;

export const StyledCounterType = styled.div`
  color: var(--color-text-secondary-readable);
  text-align: center;
  padding-bottom: 0.4rem;

  & > svg {
    width: 3.2rem;
    height: 3.2rem;
  }
`;

type TimerProps = {
  type?: TimerStatus;
  hours: string;
};

export const StyledCounterTimer = styled.h3<TimerProps>`
  ${typeStyle("timer-display")};
  /*
   * timerDisplay is 80px, but "24:56" at 80px is wider than the 240px
   * ring's inner space. Same role, scaled to fit with the icon and label.
   */
  font-size: 4.8rem;
  /* Playfair defaults to old-style figures; keep digits even and steady. */
  font-variant-numeric: lining-nums tabular-nums;
  color: ${(p) => timerColor(p.type, true)};

  width: 20rem;

  ${(p) =>
    Number(p.hours) > 0
      ? `
        display: flex;
        justify-content: center;
      `
      : `
        display: grid;
        align-items: center;
        justify-items: start;
        grid-template-columns: 1fr max-content 1fr;
        column-gap: 0.8rem;
      `}
  }}

  & > span:first-of-type {
    justify-self: end;
  }
`;

export const StyledCounterLabel = styled.p`
  ${typeStyle("eyebrow")};
  margin-top: var(--space-2);
  color: var(--color-text-secondary-readable);
`;
