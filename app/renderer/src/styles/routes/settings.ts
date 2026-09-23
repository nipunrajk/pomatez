import styled from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, typeStyle } from "styles/mixins";
import { StyledButtonSecondary } from "styles";

export const StyledSettings = styled.main`
  width: 100%;
  height: 100%;

  padding-left: 2rem;
  padding-right: 1.4rem;

  flex: 1 1;

  animation: 320ms ${themes.enterFromRight} ease;

  overflow: hidden scroll;

  ${StyledScrollbar};
`;

export const StyledSettingSection = styled.section`
  width: 100%;
  height: max-content;

  display: grid;
  align-items: center;

  row-gap: var(--space-2);
  margin-top: var(--space-2);

  /* Sections are split by a hairline rule, not boxed. */
  &:not(:first-of-type) {
    margin-top: var(--space-5);
    padding-top: var(--space-5);
    border-top: var(--component-section-header-divider-width) solid
      var(--component-section-header-divider);
  }

  &:last-of-type {
    margin-bottom: var(--space-1);
  }
`;

export const StyledSectionHeading = styled.h4`
  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);
`;

export const StyledStarButton = styled(StyledButtonSecondary)`
  width: auto;
  flex: 1 1 auto;

  & > svg {
    margin-left: -1rem;
  }
`;

export const StyledSectionSticky = styled.div`
  width: 100%;
  min-height: 7.5rem;

  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;

  gap: 1rem;

  background-color: var(--color-background-window);
  border-top: var(--border-width-hairline) solid
    var(--color-border-strong);

  display: flex;
  flex-wrap: wrap;
  grid-template-columns: 1fr;
  align-items: start;

  padding-top: 2rem;
  padding-bottom: 2rem;
`;
