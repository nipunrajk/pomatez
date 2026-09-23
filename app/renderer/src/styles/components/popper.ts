import styled from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledPopper = styled.div``;

export const StyledPopperContent = styled.div`
  min-width: 12rem;
  min-height: 3.2rem;

  position: absolute;

  padding-bottom: var(--space-1);

  border-radius: var(--radius-lg);
  background-color: var(--color-background-surface);
  box-shadow: var(--shadow-floating);

  cursor: auto;
  z-index: 10;
`;

export const StyledPopperHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0.4rem 0.8rem;
  margin-bottom: 0.4rem;

  position: relative;

  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    height: var(--border-width-hairline);

    background-color: var(--color-border-soft);
  }

  & > h4 {
    ${typeStyle("eyebrow")};
    color: var(--color-text-secondary-readable);
  }

  & > button {
    position: absolute;
    top: 0.2rem;
    right: 0.2rem;

    width: 2.4rem;
    height: 2.4rem;

    color: var(--color-icon-muted);
    border: none;
    border-radius: var(--radius-circle);
    background: transparent;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--color-icon-default);
      background-color: var(--color-background-surface-sunken);
    }

    ${focusRing};

    & > svg {
      width: var(--icon-size-sm);
      height: var(--icon-size-sm);
    }
  }
`;
