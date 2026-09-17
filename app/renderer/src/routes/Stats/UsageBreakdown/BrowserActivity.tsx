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

const BrowserActivity: React.FC<Props> = ({ entries }) => {
  const { t } = useTranslation();

  return (
    <StyledBreakdownSection>
      <StyledBreakdownTitleRow>
        <StyledBreakdownTitle>
          {t("stats.browserActivity")}
        </StyledBreakdownTitle>
        <StyledBreakdownSub>
          {entries.length === 0 ? t("stats.noSites") : t("stats.sites")}
        </StyledBreakdownSub>
      </StyledBreakdownTitleRow>
      <ActivityList
        entries={entries}
        emptyText={t("stats.browserActivityEmpty")}
      />
    </StyledBreakdownSection>
  );
};

export default React.memo(BrowserActivity);
