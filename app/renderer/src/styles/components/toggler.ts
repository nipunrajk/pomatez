import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { typeStyle } from "styles/mixins";

export const StyledTogglerWrapper = styled.div`
  width: 100%;
  min-height: 5.2rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    height: var(--border-width-hairline);

    background-color: var(--color-border-soft);
  }
`;

export const StyledTogglerLabel = styled.label`
  width: 100%;
  height: 100%;

  ${typeStyle("body")};
  color: var(--color-text-primary);

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  cursor: pointer;

  small {
    margin-top: 2px;
    font-size: 1.2rem;
    line-height: 1.4;
    color: var(--color-text-secondary-readable);
  }
`;

const KNOB_INSET = "4px";
const KNOB_SIZE = `calc(var(--component-toggle-height) - 2 * ${KNOB_INSET})`;

/** components.toggle: 60x34 pill, brand track when on, white knob. */
export const StyledTogglerSwitch = styled.input`
  flex-shrink: 0;
  width: var(--component-toggle-width);
  height: var(--component-toggle-height);

  appearance: none;
  cursor: pointer;

  position: relative;
  border-radius: var(--component-toggle-radius);

  transition: opacity 0.15s;

  &::before,
  &::after {
    content: "";
    position: absolute;
  }

  &::before {
    inset: 0;

    border-radius: var(--component-toggle-radius);
    background-color: var(--component-toggle-off-bg);

    transition: ${themes.transition};
  }

  &::after {
    top: ${KNOB_INSET};
    left: ${KNOB_INSET};

    width: ${KNOB_SIZE};
    height: ${KNOB_SIZE};

    border-radius: var(--radius-circle);
    background-color: var(--component-toggle-knob);
    box-shadow: var(--shadow-button);

    transition: left var(--motion-duration-base)
      var(--motion-easing-standard);
  }

  &:focus-visible {
    outline: var(--border-width-thick) solid var(--color-border-focus);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:checked::before {
    background-color: var(--component-toggle-on-bg);
  }

  &:checked::after {
    left: calc(100% - ${KNOB_SIZE} - ${KNOB_INSET});
  }
`;
