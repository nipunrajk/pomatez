import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, focusRing, typeStyle } from "styles/mixins";

export const StyledStats = styled.main`
  width: 100%;
  height: 100%;

  padding-left: 2rem;
  padding-right: 1.4rem;

  flex: 1 1;

  animation: 320ms ${themes.enterFromRight} ease;

  overflow: hidden scroll;

  ${StyledScrollbar};
`;

export const StyledStatsSubheading = styled.p`
  margin-top: -0.6rem;
  margin-bottom: 1.6rem;

  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);
`;

export const StyledRangePicker = styled.div`
  width: 100%;

  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;

  margin-bottom: 1.2rem;
`;

/** Outlined pill (components.tag); the selected range fills brand blue. */
export const StyledRangeButton = styled.button<{ active?: boolean }>`
  flex: 1 1 auto;

  height: var(--component-tag-height);
  padding: 0 var(--component-tag-padding-x);

  ${typeStyle("tag")};

  border-radius: var(--component-tag-radius);
  border: var(--border-width-hairline) solid var(--component-tag-border);
  background-color: transparent;
  color: var(--component-tag-text);

  cursor: pointer;

  transition: ${themes.transition};

  &:hover {
    background-color: var(--color-background-surface-sunken);
  }

  ${focusRing};

  ${({ active }) =>
    active &&
    css`
      &,
      &:hover {
        border-color: var(--component-button-primary-bg);
        color: var(--component-button-primary-text);
        background-color: var(--component-button-primary-bg);
      }
    `};
`;

export const StyledRangeDateInputs = styled.div`
  width: 100%;

  display: flex;
  gap: var(--space-2);

  margin-bottom: 1.6rem;

  & > input {
    flex: 1 1 auto;
    min-width: 0;
    height: var(--component-button-height-md);

    padding: 0 var(--space-2);

    ${typeStyle("meta")};
    color: var(--component-input-text);
    color-scheme: light dark;

    border-radius: var(--component-input-radius);
    border: var(--border-width-hairline) solid
      var(--component-input-border);
    background-color: var(--component-input-bg);

    &:focus {
      border-color: var(--color-border-focus);
    }
  }
`;

export const StyledStatsCardGrid = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);

  margin-bottom: 1.6rem;
`;

const Card = css`
  padding: var(--space-3);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);
`;

export const StyledStatsCard = styled.div`
  ${Card};
`;

export const StyledStatsCardLabel = styled.p`
  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);

  margin-bottom: var(--space-1);
`;

export const StyledStatsCardValue = styled.p`
  ${typeStyle("timer-unit")};
  /* timerUnit is 36px; scaled for the half-width cards in 340px. */
  font-size: 2.4rem;
  font-variant-numeric: lining-nums tabular-nums;

  color: var(--color-text-heading);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledStatsCardSub = styled.p`
  margin-top: var(--space-1);

  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);
`;

export const StyledChartSection = styled.section`
  width: 100%;
  margin-bottom: 1.6rem;

  ${Card};
`;

export const StyledChartHeadingRow = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);

  margin-bottom: var(--space-3);
`;

export const StyledChartHeading = styled.h4`
  font-size: 1.4rem;
  font-weight: var(--font-weight-semibold);

  color: var(--color-text-primary);
`;

export const StyledChartSummary = styled.span`
  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);

  white-space: nowrap;
`;

export const StyledChartEmptyText = styled.p`
  margin-top: var(--space-2);

  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);
`;

export const StyledBreakdownHeadingRow = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;

  margin-bottom: var(--space-2);
`;

export const StyledBreakdownSectionsHeading = styled.h3`
  ${typeStyle("card-title")};

  color: var(--color-text-heading);
`;

export const StyledBreakdownSectionsSub = styled.span`
  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);
`;

export const StyledBreakdownSection = styled.section`
  width: 100%;
  margin-bottom: var(--space-3);

  ${Card};
`;

export const StyledBreakdownTitleRow = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;

  margin-bottom: var(--space-2);
`;

export const StyledBreakdownTitle = styled.h4`
  font-size: 1.4rem;
  font-weight: var(--font-weight-semibold);

  color: var(--color-text-primary);
`;

export const StyledBreakdownSub = styled.span`
  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);
`;

export const StyledBreakdownList = styled.ul`
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const StyledBreakdownRow = styled.li`
  width: 100%;
`;

export const StyledBreakdownRowTop = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);

  margin-bottom: var(--space-1);
`;

export const StyledBreakdownName = styled.span`
  font-size: 1.3rem;
  color: var(--color-text-primary);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledBreakdownMinutes = styled.span`
  flex: 0 0 auto;

  ${typeStyle("meta")};
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary-readable);
`;

export const StyledBreakdownBarTrack = styled.div`
  width: 100%;
  height: var(--component-progress-bar-height);

  border-radius: var(--component-progress-bar-radius);
  background-color: var(--component-progress-bar-track);

  overflow: hidden;
`;

export const StyledBreakdownBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => Math.max(percent, 2)}%;

  border-radius: var(--component-progress-bar-radius);
  background-color: var(--color-brand-primary);
`;

export const StyledBreakdownEmpty = styled.div`
  padding: var(--space-3);

  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);

  border-radius: var(--radius-md);
  background-color: var(--color-background-surface-sunken);
`;
