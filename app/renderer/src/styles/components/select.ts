import styled from "styled-components/macro";

export const StyledSelect = styled.select`
  width: 100%;
  height: var(--component-input-height);

  padding: 0 4rem 0 var(--component-input-padding-x);

  color: var(--component-input-text);
  cursor: pointer;

  border-radius: var(--component-input-radius);
  border: var(--border-width-hairline) solid
    var(--component-input-border);
  background-color: var(--component-input-bg);

  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 var(--border-width-hairline)
      var(--color-border-focus);
  }
`;

export const StyledSelectWrapper = styled.div`
  position: relative;
  width: 100%;

  &::after {
    content: "";
    position: absolute;
    right: var(--component-input-padding-x);
    top: 50%;

    width: 0.6rem;
    height: 0.6rem;

    border-right: 1.5px solid var(--color-icon-default);
    border-bottom: 1.5px solid var(--color-icon-default);

    transform: translateY(-60%) rotate(45deg);
    pointer-events: none;
  }
`;
