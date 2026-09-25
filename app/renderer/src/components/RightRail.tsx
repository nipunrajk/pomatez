import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { StyledRightRail, StyledRightRailHeading } from "styles";
import { Timer } from "routes";
import { controlPanelRoute } from "config";
import PomodoroDial from "./PomodoroDial";
import RailAgenda from "./RailAgenda";

const RightRail: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const onControlPanel = pathname === controlPanelRoute.path;
  return (
    <StyledRightRail compact={onControlPanel}>
      {onControlPanel ? (
        <>
          <PomodoroDial />
          <RailAgenda />
        </>
      ) : (
        <>
          <StyledRightRailHeading>
            {t("nav.timer")}
          </StyledRightRailHeading>
          <Timer />
        </>
      )}
    </StyledRightRail>
  );
};

export default React.memo(RightRail);
