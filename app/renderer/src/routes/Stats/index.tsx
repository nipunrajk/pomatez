import React from "react";
import { StyledStats } from "styles";
import { useStats } from "hooks/useStats";

import StatsHeader from "./StatsHeader";
import SummaryCards from "./SummaryCards";
import FocusedTimeSection from "./FocusedTimeSection";
import UsageBreakdown from "./UsageBreakdown";

const Stats: React.FC = () => {
  const {
    rangeMode,
    setRangeMode,
    rangeStart,
    rangeEnd,
    setRangeStart,
    setRangeEnd,
    focusMinutes,
    sessions,
    streakDays,
    topActivity,
    chartBuckets,
    appSplit,
    browserActivity,
  } = useStats();

  return (
    <StyledStats>
      <StatsHeader
        rangeMode={rangeMode}
        setRangeMode={setRangeMode}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        setRangeStart={setRangeStart}
        setRangeEnd={setRangeEnd}
      />

      <SummaryCards
        rangeMode={rangeMode}
        focusMinutes={focusMinutes}
        sessions={sessions}
        streakDays={streakDays}
        topActivity={topActivity}
      />

      <FocusedTimeSection buckets={chartBuckets} />

      <UsageBreakdown
        appSplit={appSplit}
        browserActivity={browserActivity}
      />
    </StyledStats>
  );
};

export default Stats;
