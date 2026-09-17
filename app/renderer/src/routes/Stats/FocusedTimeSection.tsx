import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  StyledChartSection,
  StyledChartHeadingRow,
  StyledChartHeading,
  StyledChartSummary,
  StyledChartEmptyText,
} from "styles";
import { ChartBucket } from "hooks/useStats";
import FocusedTimeChart from "./FocusedTimeChart";
import { formatMinutes } from "./formatMinutes";

type Props = {
  buckets: ChartBucket[];
};

const FocusedTimeSection: React.FC<Props> = ({ buckets }) => {
  const { t } = useTranslation();

  const total = useMemo(
    () => buckets.reduce((sum, bucket) => sum + bucket.minutes, 0),
    [buckets]
  );

  return (
    <StyledChartSection>
      <StyledChartHeadingRow>
        <StyledChartHeading>
          {t("stats.focusedTime")}
        </StyledChartHeading>
        <StyledChartSummary>
          {formatMinutes(total)} {t("stats.total")}
        </StyledChartSummary>
      </StyledChartHeadingRow>

      <FocusedTimeChart buckets={buckets} />

      {total === 0 && (
        <StyledChartEmptyText>
          {t("stats.chartEmpty")}
        </StyledChartEmptyText>
      )}
    </StyledChartSection>
  );
};

export default React.memo(FocusedTimeSection);
