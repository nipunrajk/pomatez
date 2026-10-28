import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyledStatsCardGrid,
  StyledStatsCard,
  StyledStatsCardLabel,
  StyledStatsCardValue,
  StyledStatsActivityValue,
  StyledStatsCardSub,
} from "styles";
import { RangeMode } from "hooks/useStats";
import { formatMinutes } from "./formatMinutes";

type Props = {
  rangeMode: RangeMode;
  focusMinutes: number;
  sessions: number;
  streakDays: number;
  topActivity: string | null;
};

const SummaryCards: React.FC<Props> = ({
  rangeMode,
  focusMinutes,
  sessions,
  streakDays,
  topActivity,
}) => {
  const { t } = useTranslation();

  const focusTimeSub =
    rangeMode === "today"
      ? t("stats.today")
      : rangeMode === "7d"
      ? t("stats.last7Days")
      : t("stats.selectedRange");

  return (
    <StyledStatsCardGrid>
      <StyledStatsCard>
        <StyledStatsCardLabel>
          {t("stats.focusTime")}
        </StyledStatsCardLabel>
        <StyledStatsCardValue>
          {formatMinutes(focusMinutes)}
        </StyledStatsCardValue>
        <StyledStatsCardSub>{focusTimeSub}</StyledStatsCardSub>
      </StyledStatsCard>

      <StyledStatsCard>
        <StyledStatsCardLabel>
          {t("stats.sessions")}
        </StyledStatsCardLabel>
        <StyledStatsCardValue>{sessions}</StyledStatsCardValue>
        <StyledStatsCardSub>
          {t("stats.focusBlocks")}
        </StyledStatsCardSub>
      </StyledStatsCard>

      <StyledStatsCard>
        <StyledStatsCardLabel>{t("stats.streak")}</StyledStatsCardLabel>
        <StyledStatsCardValue>{streakDays}</StyledStatsCardValue>
        <StyledStatsCardSub>{t("stats.days")}</StyledStatsCardSub>
      </StyledStatsCard>

      <StyledStatsCard>
        <StyledStatsCardLabel>
          {t("stats.topActivity")}
        </StyledStatsCardLabel>
        <StyledStatsActivityValue>
          {topActivity ?? t("stats.none")}
        </StyledStatsActivityValue>
      </StyledStatsCard>
    </StyledStatsCardGrid>
  );
};

export default React.memo(SummaryCards);
