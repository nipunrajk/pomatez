import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyledBreakdownSection,
  StyledBreakdownTitleRow,
  StyledBreakdownTitle,
  StyledBreakdownSub,
} from "styles";
import { ActivityEntry } from "hooks/useStats";
import ActivityList from "./ActivityList";

type Props = {
  entries: ActivityEntry[];
};

const AppSplit: React.FC<Props> = ({ entries }) => {
  const { t } = useTranslation();

  return (
    <StyledBreakdownSection>
      <StyledBreakdownTitleRow>
        <StyledBreakdownTitle>
          {t("stats.appSplit")}
        </StyledBreakdownTitle>
        <StyledBreakdownSub>
          {entries.length === 0
            ? t("stats.noAppData")
            : t("stats.apps")}
        </StyledBreakdownSub>
      </StyledBreakdownTitleRow>
      <ActivityList
        entries={entries}
        emptyText={t("stats.appSplitEmpty")}
      />
    </StyledBreakdownSection>
  );
};

export default React.memo(AppSplit);
