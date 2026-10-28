import styled from "styled-components/macro";
import { typeStyle } from "styles/mixins";

export const StyledTimerStatsGrid = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);

  padding: 0 1.6rem;
  margin-top: 1.6rem;
`;

export const StyledTimerStatCard = styled.div`
  min-width: 0;
  padding: var(--space-3) var(--space-2);

  border-radius: var(--component-card-radius);
  background-color: var(--component-card-bg);
  box-shadow: var(--component-card-shadow);
`;

export const StyledTimerStatLabel = styled.p`
  ${typeStyle("eyebrow")};
  color: var(--color-text-secondary-readable);
  margin-bottom: var(--space-1);

  /* Narrow 3-up cards: wrap rather than truncate "Top Activity". */
  overflow-wrap: break-word;
`;

export const StyledTimerStatValue = styled.p`
  font-size: 1.8rem;
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: lining-nums tabular-nums;
  color: var(--color-text-heading);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledTimerStatSub = styled.p`
  margin-top: var(--space-1);

  ${typeStyle("meta")};
  color: var(--color-text-secondary-readable);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Activity names are text, rather than large numeric metrics. */
export const StyledTimerActivityValue = styled.p`
  ${typeStyle("meta")};
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-heading);
  overflow-wrap: anywhere;
`;
