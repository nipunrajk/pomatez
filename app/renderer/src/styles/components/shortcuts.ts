import styled from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledShortcutWrapper = styled.div`
  width: 100%;
  height: 4rem;

  display: grid;
  align-items: center;
  grid-template-columns: 1fr max-content;

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

export const StyledShortcutName = styled.label`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
`;

export const StyledShortcutKey = styled.input`
  width: max-content;
  max-width: 15rem;
  height: var(--component-input-kbd-hint-height);
  padding: 0 var(--component-input-kbd-hint-padding-x);

  ${typeStyle("kbd")};
  text-align: center;
  text-transform: capitalize;
  /* kbdHint.text (#A7A7A2) is ~1.8:1 on the chip; these are real values. */
  color: var(--color-text-primary);

  border: none;
  border-radius: var(--component-input-kbd-hint-radius);
  background-color: var(--component-input-kbd-hint-bg);

  &:focus {
    outline: var(--border-width-thick) solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;
