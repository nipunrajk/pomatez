import styled, { css } from "styled-components/macro";
import {
  StyledButtonNormal,
  StyledInput,
  StyledTextArea,
} from "styles";
import { themes } from "styles/themes";
import { StyledScrollbar, focusRing, typeStyle } from "styles/mixins";

export const StyledTaskMain = styled.main`
  position: relative;
  overflow: hidden;
  flex: 1 1;
`;

export const StyledTaskContainer = styled.div`
  width: 100%;
  height: 100%;

  padding-left: 2rem;
  padding-right: 1.4rem;

  background-color: var(--color-bg-primary);

  animation: 320ms ${themes.enterFromLeft} ease;

  overflow: hidden scroll;

  ${StyledScrollbar};
`;

export const StyledTaskWrapper = styled.div``;

export const StyledTaskSection = styled.section`
  width: 100%;
  height: calc(100% + 6.4rem);

  display: grid;
  align-content: start;

  padding-top: 1rem;

  & > div[data-rbd-draggable-context-id] {
    margin: 0.6rem 0;
  }
`;

type SectionTypes = {
  isDragging?: boolean;
  priority?: boolean;
};

export const StyledTaskSectionItem = styled.div<SectionTypes>`
  width: 100%;
  height: max-content;
  min-height: 7.8rem;

  padding: var(--space-3);

  /* The priority list keeps its accent, now as the list's top rule. */
  border-radius: var(--radius-lg);
  border-top: var(--border-width-thick) solid
    ${(p) =>
      p.priority
        ? "var(--color-timer-long-break)"
        : "var(--color-brand-primary)"};

  background-color: var(--color-background-surface-sunken);

  transition: box-shadow var(--motion-duration-slow)
      var(--motion-easing-standard),
    rotate var(--motion-duration-base) var(--motion-easing-emphasized);

  ${(p) =>
    p.isDragging &&
    css`
      box-shadow: var(--shadow-dragging);
      /* rotate (not transform) so it composes with the drag translate. */
      rotate: -4deg;
    `};
`;

export const StyledTaskHeader = styled.header`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr max-content;
  column-gap: 0.5rem;

  margin-bottom: 0.8rem;

  position: relative;

  &:hover > button,
  &:focus > button,
  &:active > button {
    color: var(--color-icon-default);
  }
`;

export const StyledTaskHeading = styled.h3`
  padding: var(--space-1) var(--space-2);

  ${typeStyle("list-title")};
  color: var(--color-text-heading);

  overflow: hidden;
  overflow-wrap: break-word;
`;

export const StyledTaskHeadeInput = styled(StyledInput)`
  padding: var(--space-1) var(--space-2);

  height: max-content;

  ${typeStyle("list-title")};
  color: var(--color-text-heading);
`;

export const StyledTaskHeaderOption = styled.button`
  align-self: start;

  width: 3.2rem;
  min-height: 3.2rem;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-icon-muted);
  border: none;
  border-radius: var(--radius-circle);
  background-color: transparent;
  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    color: var(--color-icon-default) !important;
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};

  & > svg {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
`;

export const StyledTaskStickySection = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;

  width: 100%;
  height: max-content;
  min-height: 6.4rem;

  padding-top: 1.2rem;
  padding-bottom: 2rem;

  backdrop-filter: blur(12px);
  background-color: rgba(var(--color-background-window-rgb), 0.85);
  border-top: var(--border-width-hairline) solid
    var(--color-border-strong);
`;

export const StyledTaskForm = styled.form`
  width: 100%;
  height: max-content;

  display: grid;
  row-gap: 1rem;
  column-gap: 0.8rem;
  grid-template-columns: repeat(2, 1fr);
`;

export const StyledTaskInput = styled(StyledInput)`
  grid-column: 1 / -1;
`;

export const StyledTaskTextArea = styled(StyledTextArea)`
  grid-column: 1 / -1;
`;

export const StyledTaskCardCancel = styled(StyledButtonNormal)``;

export const StyledTaskDimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  z-index: 100;

  /* padding: 1.6rem 2rem; */

  background-color: var(--color-background-overlay);
  backdrop-filter: blur(12px);
`;

export const StyledTaskDetailContainer = styled.div`
  position: sticky;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  padding: 0.4rem;

  background-color: var(--color-bg-detail-container);
  box-shadow: 0 4px 12px -4px var(--color-shadow-primary);
`;
