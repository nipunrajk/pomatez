import styled, { css } from "styled-components/macro";
import { focusRing } from "styles/mixins";

export const StyledCozyTimer = styled.main`
  width: 100%;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px 12px;

  header {
    margin: 0 !important;
    padding: 0;
    min-height: 26px;
    flex: 0 0 26px;
  }

  header h3 {
    font-size: 16px;
    line-height: 24px;
    letter-spacing: -0.3px;
    margin: 0;
  }
`;

export const StyledClockDial = styled.section<{
  $accent: string;
  $accentReadable: string;
  $animate: boolean;
}>`
  --clock-accent: ${(p) => p.$accent};
  --clock-accent-readable: ${(p) => p.$accentReadable};

  flex: 0 0 232px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 4px 0;
  padding: 0;

  .clock-face {
    position: relative;
    width: 232px;
    height: 232px;
  }

  .clock-face > svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* Recessed dark groove track */
  .orbit-track {
    fill: none;
    stroke: var(--color-cozy-dial-track);
    stroke-width: 10px;
    opacity: 0.35;
  }

  /* Luminous progress arc - crisp edge glow */
  .orbit-progress {
    fill: none;
    stroke-width: 10px;
    stroke-linecap: round;
    filter: drop-shadow(0 0 5px var(--clock-accent));
  }

  /* Luminous comet-head bead leading the arc */
  .orbit-bead {
    transform-origin: 116px 116px;
  }

  .orbit-bead circle {
    fill: #ffffff;
    stroke: var(--clock-accent);
    stroke-width: 2.4px;
    filter: drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 6px var(--clock-accent));
  }

  /* Centered countdown display */
  .dial-readout {
    position: absolute;
    top: 52px;
    left: 16px;
    right: 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }

  .countdown {
    margin: 0;
    font-size: 44px;
    line-height: 48px;
    font-weight: 600;
    letter-spacing: -1.6px;
    font-variant-numeric: tabular-nums lining-nums;
    color: var(--color-text-primary);
  }

  /* Playback controls centered in the lower arc */
  .clock-controls {
    position: absolute;
    top: 132px;
    left: 40px;
    right: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  button {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-secondary-readable);
    cursor: pointer;
    transition:
      background 150ms ease,
      color 150ms ease,
      transform 150ms ease;
    ${focusRing};

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--clock-accent);
    }

    &:active {
      transform: scale(0.92);
    }
  }

  .clock-play {
    width: 44px;
    height: 44px;
    color: var(--color-cozy-play-icon);
    background: var(--clock-accent);
    box-shadow:
      0 4px 14px -1px var(--clock-accent),
      0 2px 6px rgba(0, 0, 0, 0.35);
    transition:
      transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 150ms ease,
      filter 150ms ease;

    &:hover {
      color: var(--color-cozy-play-icon);
      background: var(--clock-accent);
      filter: brightness(1.08);
      transform: scale(1.06);
      box-shadow:
        0 6px 18px 0px var(--clock-accent),
        0 3px 8px rgba(0, 0, 0, 0.4);
    }

    &:active {
      transform: scale(0.94);
    }
  }

  .clock-status {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 310px;
    font-size: 10px;
    line-height: 16px;
    color: var(--color-warning-text-readable);
    text-align: center;
    margin-top: 4px;

    &:empty {
      display: none;
    }
  }

  ${(p) =>
    p.$animate &&
    css`
      .orbit-progress {
        transition: stroke-dashoffset 1s linear;
      }
      .orbit-bead {
        transition: transform 1s linear;
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    .orbit-progress,
    .orbit-bead {
      transition: none;
    }
  }
`;

export const StyledCozyFooter = styled.footer`
  position: relative;
  width: 100%;
  flex: 0 0 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;

  .cozy-round {
    color: var(--color-text-secondary-readable);
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 0.3px;
    font-variant-numeric: tabular-nums;
  }
`;
