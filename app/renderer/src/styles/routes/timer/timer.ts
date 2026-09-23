import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { focusRing, typeStyle } from "styles/mixins";

export const StyledTimer = styled.main`
  width: 100%;
  height: 100%;

  flex: 1 1;

  padding-top: 1.2rem;

  display: flex;
  flex-direction: column;
  align-items: end;

  &.compact {
    padding-top: 0;
    display: grid;
    grid-auto-flow: column;
    justify-content: center;
    align-content: start;
    align-items: center;
  }

  animation: enterFromBottom 160ms ease;

  @keyframes enterFromBottom {
    0% {
      opacity: 0;
      transform: translateY(1.2rem);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const StyledSectionSeparator = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--color-border-primary);
`;

export const StyledPriorityCardContainer = styled.div`
  width: 100%;
  min-height: 5.6rem;
  padding: 0 1.6rem;
`;

export const StyledPriorityCardOption = styled.button`
  position: absolute;
  top: 0;
  right: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0.4rem 0rem;
  margin: 0.4rem 0.6rem;

  color: var(--color-icon-muted);

  border: none;
  border-radius: var(--radius-sm);
  background-color: transparent;

  transition: ${themes.transition};

  &:hover,
  &:focus {
    color: var(--color-icon-default);
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;

export const StyledPriorityCardWrapper = styled.div`
  position: relative;

  width: 100%;
  height: 100%;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  min-height: 5.6rem;
  padding: var(--layout-compact-task-box-padding);

  border-radius: var(--layout-compact-task-box-radius);
  border: none;
  background-color: var(--layout-compact-task-box-bg);
  box-shadow: var(--shadow-card);
`;

export const StyledPriorityCardHeader = styled.header`
  width: 100%;
`;

export const StyledPriorityCardHeading = styled.h4`
  ${typeStyle("card-title")};
  padding-right: 1.6rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const StyledPriorityCardDescription = styled.p`
  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;
