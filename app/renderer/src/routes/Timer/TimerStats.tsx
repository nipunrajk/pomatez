import React from "react";
import { useTranslation } from "react-i18next";
import { useStats } from "hooks/useStats";
import {
  StyledTimerStatsGrid,
  StyledTimerStatCard,
  StyledTimerStatLabel,
  StyledTimerStatValue,
  StyledTimerActivityValue,
  StyledTimerStatSub,
} from "styles";
import { formatMinutes } from "../Stats/formatMinutes";

/** Today (focus time + sessions), streak, and top activity, always "today". */
const TimerStats: React.FC = () => {
  const { t } = useTranslation();
  const { focusMinutes, sessions, streakDays, topActivity } =
    useStats();

  return (
    <StyledTimerStatsGrid>
      <StyledTimerStatCard>
        <StyledTimerStatLabel>{t("stats.today")}</StyledTimerStatLabel>
        <StyledTimerStatValue>
          {formatMinutes(focusMinutes)}
        </StyledTimerStatValue>
        <StyledTimerStatSub>
          {sessions} {t("stats.sessions").toLowerCase()}
        </StyledTimerStatSub>
      </StyledTimerStatCard>

      <StyledTimerStatCard>
        <StyledTimerStatLabel>{t("stats.streak")}</StyledTimerStatLabel>
        <StyledTimerStatValue>{streakDays}</StyledTimerStatValue>
        <StyledTimerStatSub>{t("stats.days")}</StyledTimerStatSub>
      </StyledTimerStatCard>

      <StyledTimerStatCard>
        <StyledTimerStatLabel>
          {t("stats.topActivity")}
        </StyledTimerStatLabel>
        <StyledTimerActivityValue>
          {topActivity ?? t("stats.none")}
        </StyledTimerActivityValue>
      </StyledTimerStatCard>
    </StyledTimerStatsGrid>
  );
};

export default React.memo(TimerStats);
