import styled from "styled-components/macro";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledCollapse = styled.div`
  width: 100%;
  min-height: 4rem;

  display: grid;
  grid-template-rows: 4rem;
`;

export const StyledCollapseHeading = styled.h4<{ open?: boolean }>`
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  ${typeStyle("body")};
  color: var(--color-text-primary);
  border: none;
  background-color: transparent;
  cursor: pointer;

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);

    margin-right: 0.8rem;

    transform: ${(p) => p.open && "rotate(180deg)"};
    transition: transform var(--motion-duration-base)
      var(--motion-easing-standard);
  }

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

export const StyledCollapseContent = styled.div`
  width: 100%;
  height: 4rem;

  display: flex;
  align-items: center;

  animation: enter 180ms ease;

  & > label:not(:last-of-type) {
    margin-right: 3.2rem;
  }

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

  @keyframes enter {
    0% {
      opacity: 0;
      transform: translateY(-1rem);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
