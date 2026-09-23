import styled, { css } from "styled-components/macro";
import { themes } from "styles/themes";
import { StyledScrollbar, typeStyle } from "styles/mixins";

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

  font-size: 1.2rem;
  color: var(--color-disabled-text);
`;

export const StyledRangePicker = styled.div`
  width: 100%;

  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;

  margin-bottom: 1.2rem;
`;

export const StyledRangeButton = styled.button<{ active?: boolean }>`
  flex: 1 1 auto;

  padding: 0.6rem 1rem;

  font-size: 1.2rem;
  font-weight: 500;

  border-radius: 3px;
  border: 0.1rem solid var(--color-border-primary);
  background-color: transparent;
  color: var(--color-body-text);

  cursor: pointer;

  transition: ${themes.transition};

  ${({ active }) =>
    active &&
    css`
      border-color: var(--color-primary);
      color: var(--color-primary);
      background-color: rgba(var(--color-primary-rgb), 0.12);
    `};

  &:hover,
  &:focus {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
`;

export const StyledRangeDateInputs = styled.div`
  width: 100%;

  display: flex;
  gap: 0.8rem;

  margin-bottom: 1.6rem;

  & > input {
    flex: 1 1 auto;
    min-width: 0;

    padding: 0.5rem 0.6rem;

    font-size: 1.2rem;
    color: var(--color-body-text);

    border-radius: 3px;
    border: 0.1rem solid var(--color-border-primary);
    background-color: var(--color-bg-input);
  }
`;

export const StyledStatsCardGrid = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;

  margin-bottom: 1.6rem;
`;

export const StyledStatsCard = styled.div`
  padding: 1.2rem;

  border-radius: 6px;
  background-color: var(--color-bg-secondary);
`;

export const StyledStatsCardLabel = styled.p`
  font-size: 1rem;
  font-weight: 500;

  color: var(--color-disabled-text);
  text-transform: uppercase;

  margin-bottom: 0.6rem;
`;

export const StyledStatsCardValue = styled.p`
  font-size: 2rem;
  font-weight: 700;

  color: var(--color-heading-text);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledStatsCardSub = styled.p`
  margin-top: 0.2rem;

  font-size: 1.1rem;
  color: var(--color-disabled-text);
`;

export const StyledChartSection = styled.section`
  width: 100%;

  padding: 1.2rem;
  margin-bottom: 1.6rem;

  border-radius: 6px;
  background-color: var(--color-bg-secondary);
`;

export const StyledChartHeadingRow = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;

  margin-bottom: 1rem;
`;

export const StyledChartHeading = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;

  color: var(--color-heading-text);
`;

export const StyledChartSummary = styled.span`
  font-size: 1.1rem;
  color: var(--color-disabled-text);

  white-space: nowrap;
`;

export const StyledChartEmptyText = styled.p`
  margin-top: 0.8rem;

  font-size: 1.1rem;
  color: var(--color-disabled-text);
`;

export const StyledBreakdownHeadingRow = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;

  margin-bottom: 0.8rem;
`;

export const StyledBreakdownSectionsHeading = styled.h3`
  ${typeStyle("card-title")};

  color: var(--color-heading-text);
`;

export const StyledBreakdownSectionsSub = styled.span`
  font-size: 1.1rem;
  color: var(--color-disabled-text);
`;

export const StyledBreakdownSection = styled.section`
  width: 100%;

  padding: 1.2rem;
  margin-bottom: 1.2rem;

  border-radius: 6px;
  background-color: var(--color-bg-secondary);
`;

export const StyledBreakdownTitleRow = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;

  margin-bottom: 0.8rem;
`;

export const StyledBreakdownTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;

  color: var(--color-heading-text);
`;

export const StyledBreakdownSub = styled.span`
  font-size: 1.1rem;
  color: var(--color-disabled-text);
`;

export const StyledBreakdownList = styled.ul`
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const StyledBreakdownRow = styled.li`
  width: 100%;
`;

export const StyledBreakdownRowTop = styled.div`
  width: 100%;

  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;

  margin-bottom: 0.4rem;
`;

export const StyledBreakdownName = styled.span`
  font-size: 1.2rem;
  color: var(--color-body-text);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledBreakdownMinutes = styled.span`
  flex: 0 0 auto;

  font-size: 1.1rem;
  color: var(--color-disabled-text);
`;

export const StyledBreakdownBarTrack = styled.div`
  width: 100%;
  height: 0.6rem;

  border-radius: 999px;
  background-color: var(--color-border-secondary);

  overflow: hidden;
`;

export const StyledBreakdownBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => Math.max(percent, 2)}%;

  border-radius: 999px;
  background-color: var(--color-primary);
`;

export const StyledBreakdownEmpty = styled.div`
  padding: 1rem;

  font-size: 1.1rem;
  color: var(--color-disabled-text);

  border-radius: 4px;
  background-color: var(--color-bg-tertiary);
`;
