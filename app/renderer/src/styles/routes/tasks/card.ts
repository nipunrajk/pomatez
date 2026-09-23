import styled, { css } from "styled-components/macro";
import { StyledButton, StyledButtonPrimary } from "styles";
import { focusRing } from "styles/mixins";

export const StyledCardText = styled.p<{ done?: boolean }>`
  min-height: 2.4rem;
  margin-right: 5px;
  white-space: pre-wrap;
  word-break: break-word;

  display: flex;
  align-items: center;
  overflow: hidden;

  ${(p) =>
    p.done &&
    css`
      color: var(--color-status-completed-readable);
      text-decoration: line-through;
    `}
`;

export const StyledCardTextArea = styled.textarea`
  resize: none;
  border: none;
  background-color: transparent;

  flex-grow: 2;
  margin-right: 5px;
`;

const ButtonCardStyles = css`
  align-self: start;

  width: 2.4rem;
  min-height: 2.4rem;
  height: max-content;

  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: var(--radius-sm);

  & > svg {
    margin: 0;
  }
`;

export const StyledCardActionWrapper = styled.div`
  width: max-content;
  height: 100%;

  display: flex;
  align-items: center;
`;

export const StyledCardEditButton = styled(StyledButton)`
  ${ButtonCardStyles};
`;

export const StyledCardDeleteButton = styled(StyledButton)`
  ${ButtonCardStyles};

  &:hover {
    color: var(--color-status-danger-readable) !important;
  }
`;

export const StyledCardSaveButton = styled(StyledButtonPrimary)`
  ${ButtonCardStyles};
`;

type CardProps = {
  isDragging?: boolean;
  focused?: boolean;
};

export const StyledCard = styled.div<CardProps>`
  width: 100%;
  height: 3.6rem;
  height: max-content;

  padding: var(--space-2);
  padding-left: var(--space-3);
  margin-bottom: var(--layout-dashboard-content-board-card-gap);

  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  color: var(--color-text-primary);
  border: none;
  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);

  transition: box-shadow var(--motion-duration-base)
      var(--motion-easing-standard),
    background-color var(--motion-duration-base)
      var(--motion-easing-standard),
    rotate var(--motion-duration-base) var(--motion-easing-emphasized);

  &:hover,
  &:active {
    box-shadow: var(--shadow-card-hover);

    ${StyledCardEditButton}, ${StyledCardDeleteButton} {
      color: var(--color-icon-default);
    }
  }

  ${focusRing};

  ${(p) =>
    p.focused &&
    css`
      box-shadow: 0 0 0 var(--border-width-hairline)
        var(--color-border-focus);
    `}

  /* components.card.highlighted: the card being dragged. */
  ${(p) =>
    p.isDragging &&
    css`
      &,
      &:hover {
        color: var(--component-card-highlighted-text);
        background-color: var(--component-card-highlighted-bg);
        box-shadow: var(--component-card-highlighted-shadow);
        /* rotate (not transform) so it composes with the drag translate. */
        rotate: -4deg;

        ${StyledCardEditButton}, ${StyledCardDeleteButton} {
          color: var(--component-card-highlighted-text);
        }
      }
    `}
`;

export const StyledCardWrapper = styled.div``;
