import React from "react";
import { useTranslation } from "react-i18next";
import { StyledRightRail, StyledRightRailHeading } from "styles";
import { Timer } from "routes";

/**
 * Persistent Timer widget shown on every dashboard page: the ring,
 * controls, and stat cards, without the classic-only header/menu (Timer
 * itself already gates that on the current layout).
 */
const RightRail: React.FC = () => {
  const { t } = useTranslation();

  return (
    <StyledRightRail>
      <StyledRightRailHeading>{t("nav.timer")}</StyledRightRailHeading>
      <Timer />
    </StyledRightRail>
  );
};

export default React.memo(RightRail);
