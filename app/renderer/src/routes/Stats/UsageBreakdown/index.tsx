import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyledBreakdownColumns,
  StyledBreakdownHeadingRow,
  StyledBreakdownSectionsHeading,
  StyledBreakdownSectionsSub,
} from "styles";
import { ActivityEntry } from "hooks/useStats";
import AppSplit from "./AppSplit";
import BrowserActivity from "./BrowserActivity";

type Props = {
  appSplit: ActivityEntry[];
  browserActivity: ActivityEntry[];
};

const UsageBreakdown: React.FC<Props> = ({
  appSplit,
  browserActivity,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <StyledBreakdownHeadingRow>
        <StyledBreakdownSectionsHeading>
          {t("stats.usageBreakdown")}
        </StyledBreakdownSectionsHeading>
        <StyledBreakdownSectionsSub>
          {t("stats.usageBreakdownSub")}
        </StyledBreakdownSectionsSub>
      </StyledBreakdownHeadingRow>

      <StyledBreakdownColumns>
        <AppSplit entries={appSplit} />
        <BrowserActivity entries={browserActivity} />
      </StyledBreakdownColumns>
    </>
  );
};

export default React.memo(UsageBreakdown);
