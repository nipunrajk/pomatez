import styled from "styled-components/macro";
import { StyledScrollbar } from "styles/mixins";

export const StyledTextArea = styled.textarea`
  width: 100%;
  padding: var(--space-3) var(--component-input-padding-x);

  resize: none;

  ${StyledScrollbar};

  color: var(--component-input-text);

  border-radius: var(--component-input-radius);
  border: var(--border-width-hairline) solid
    var(--component-input-border);
  background-color: var(--component-input-bg);
  transition: border-color var(--motion-duration-fast)
    var(--motion-easing-standard);

  &::placeholder {
    /* input.placeholder (#89897E) is 3.0:1; readable variant. */
    color: var(--color-text-placeholder-readable);
  }

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 var(--border-width-hairline)
      var(--color-border-focus);
  }
`;
