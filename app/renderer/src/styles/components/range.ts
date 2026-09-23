import styled from "styled-components/macro";
import { themes } from "../themes";
import { typeStyle } from "styles/mixins";

export const StyledRangeContainer = styled.div`
  width: 100%;
  height: max-content;

  display: grid;
  row-gap: 0.8rem;

  padding: 0.8rem 0;
`;

export const StyledRangeWrapper = styled.div`
  width: 100%;
  height: var(--component-progress-bar-height);

  position: relative;
`;

type FillTypes = { value: number; minValue: number; maxValue: number };

export const StyledRangeSliderFill = styled.div<FillTypes>`
  position: absolute;
  top: 0;
  left: 0;

  width: ${({ value, minValue, maxValue }) => {
    if (maxValue >= 60 && value <= 6) {
      const finalValue =
        (value - minValue) / (maxValue - minValue - value);

      if (value <= 3) return `calc((${finalValue} * 100%) + 16px)`;

      return `calc(${finalValue} * 100%)`;
    }

    return `calc((${value - minValue} / ${
      maxValue - minValue
    }) * 100%)`;
  }};
  height: var(--component-progress-bar-height);

  border-radius: var(--component-progress-bar-radius);
  background-color: var(--color-brand-primary);

  z-index: 1;
`;

export const StyledRangeSlider = styled.input`
  width: 100%;
  height: var(--component-progress-bar-height);

  appearance: none;
  border-radius: var(--component-progress-bar-radius);
  background-color: var(--component-progress-bar-track);

  position: absolute;
  top: 0;
  left: 0;

  &::-webkit-slider-thumb {
    appearance: none;

    width: 1.6rem;
    height: 1.6rem;

    border-radius: var(--radius-circle);
    border: var(--border-width-hairline) solid
      var(--color-border-strong);
    background-color: var(--component-toggle-knob);

    box-shadow: var(--shadow-button);

    transition: transform var(--motion-duration-fast) ${themes.easing};

    cursor: pointer;

    position: relative;
    z-index: 2;
  }

  &:hover::-webkit-slider-thumb,
  &:active::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  &:focus-visible::-webkit-slider-thumb {
    outline: var(--border-width-thick) solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

export const StyledRangeInputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledRangeInputLabel = styled.p`
  color: var(--color-text-primary);
`;

export const StyledRangeInputValue = styled.p`
  ${typeStyle("meta")};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary-readable);
`;
