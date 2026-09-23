import styled from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledHelpWrapper = styled.a`
  width: 100%;
  height: 4rem;

  display: grid;
  align-items: center;
  grid-template-columns: 1fr max-content;

  position: relative;
  color: var(--color-text-primary);

  &:hover,
  &:focus {
    color: var(--color-brand-primary-readable);
  }

  ${focusRing};

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

export const StyledHelpLabel = styled.span`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledHelpExternal = styled.span`
  ${typeStyle("tag")};
  display: inline-flex;
  align-items: center;
  height: var(--component-tag-height);
  padding: 0 var(--component-tag-padding-x);

  border-radius: var(--component-tag-radius);
  border: var(--border-width-hairline) solid var(--component-tag-border);
`;
