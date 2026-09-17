import React from "react";
import {
  StyledBreakdownList,
  StyledBreakdownRow,
  StyledBreakdownRowTop,
  StyledBreakdownName,
  StyledBreakdownMinutes,
  StyledBreakdownBarTrack,
  StyledBreakdownBarFill,
  StyledBreakdownEmpty,
} from "styles";
import { ActivityEntry } from "hooks/useStats";
import { formatMinutes } from "../formatMinutes";

type Props = {
  entries: ActivityEntry[];
  emptyText: string;
  maxRows?: number;
};

const ActivityList: React.FC<Props> = ({
  entries,
  emptyText,
  maxRows = 6,
}) => {
  if (entries.length === 0) {
    return <StyledBreakdownEmpty>{emptyText}</StyledBreakdownEmpty>;
  }

  return (
    <StyledBreakdownList>
      {entries.slice(0, maxRows).map((entry) => (
        <StyledBreakdownRow key={entry.name}>
          <StyledBreakdownRowTop>
            <StyledBreakdownName>{entry.name}</StyledBreakdownName>
            <StyledBreakdownMinutes>
              {formatMinutes(entry.minutes)}
            </StyledBreakdownMinutes>
          </StyledBreakdownRowTop>
          <StyledBreakdownBarTrack>
            <StyledBreakdownBarFill percent={entry.percent} />
          </StyledBreakdownBarTrack>
        </StyledBreakdownRow>
      ))}
    </StyledBreakdownList>
  );
};

export default React.memo(ActivityList);
