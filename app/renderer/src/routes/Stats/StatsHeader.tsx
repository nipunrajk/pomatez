import React from "react";
import { useTranslation } from "react-i18next";
import { Header } from "components";
import {
  StyledStatsSubheading,
  StyledRangePicker,
  StyledRangeButton,
  StyledRangeDateInputs,
} from "styles";
import { RangeMode } from "hooks/useStats";

type Props = {
  rangeMode: RangeMode;
  setRangeMode: (mode: RangeMode) => void;
  rangeStart: string;
  rangeEnd: string;
  setRangeStart: (value: string) => void;
  setRangeEnd: (value: string) => void;
};

const StatsHeader: React.FC<Props> = ({
  rangeMode,
  setRangeMode,
  rangeStart,
  rangeEnd,
  setRangeStart,
  setRangeEnd,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Header heading={t("stats.title")} />
      <StyledStatsSubheading>
        {t("stats.subtitle")}
      </StyledStatsSubheading>

      <StyledRangePicker>
        <StyledRangeButton
          type="button"
          active={rangeMode === "today"}
          onClick={() => setRangeMode("today")}
        >
          {t("stats.rangeToday")}
        </StyledRangeButton>
        <StyledRangeButton
          type="button"
          active={rangeMode === "7d"}
          onClick={() => setRangeMode("7d")}
        >
          {t("stats.range7d")}
        </StyledRangeButton>
        <StyledRangeButton
          type="button"
          active={rangeMode === "range"}
          onClick={() => setRangeMode("range")}
        >
          {t("stats.rangeCustom")}
        </StyledRangeButton>
      </StyledRangePicker>

      {rangeMode === "range" && (
        <StyledRangeDateInputs>
          <input
            type="date"
            value={rangeStart}
            max={rangeEnd}
            onChange={(e) => setRangeStart(e.target.value)}
          />
          <input
            type="date"
            value={rangeEnd}
            min={rangeStart}
            onChange={(e) => setRangeEnd(e.target.value)}
          />
        </StyledRangeDateInputs>
      )}
    </>
  );
};

export default React.memo(StatsHeader);
