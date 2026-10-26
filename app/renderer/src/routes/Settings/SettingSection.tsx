import React, { useContext } from "react";
import {
  StyledSettingSection,
  StyledSectionHeading,
  StyledSettingsCard,
} from "styles";
import { matchesQuery, SettingsFilterContext } from "./SettingsFilterContext";

type Props = {
  /** Anchor for the filter bar's jump pills. */
  id: string;
  heading: string;
  /** Row texts the search can match; the card hides when none do. */
  searchText?: (string | undefined)[];
  /** Freeform content (forms, pickers) instead of flush rows. */
  padded?: boolean;
  children?: React.ReactNode;
};

/** A settings group: eyebrow heading above a surfaced card. */
const SettingSection: React.FC<Props> = ({
  id,
  heading,
  searchText = [],
  padded,
  children,
}) => {
  const query = useContext(SettingsFilterContext);
  const headingMatches = matchesQuery(query, heading);

  if (!headingMatches && !matchesQuery(query, ...searchText)) {
    return null;
  }

  return (
    <StyledSettingSection id={id} data-settings-card>
      <StyledSectionHeading>{heading}</StyledSectionHeading>
      {/* A heading match shows the whole group, unfiltered. */}
      <SettingsFilterContext.Provider value={headingMatches ? "" : query}>
        <StyledSettingsCard padded={padded}>{children}</StyledSettingsCard>
      </SettingsFilterContext.Provider>
    </StyledSettingSection>
  );
};

export default SettingSection;
