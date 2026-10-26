import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "hooks/storeHooks";
import { StyledCozyFooter } from "styles/routes/timer/clockDial";

const CozyFooter: React.FC = () => {
  const { t } = useTranslation();
  const round = useAppSelector((state) => state.timer.round);
  const total = useAppSelector((state) => state.config.sessionRounds);

  return (
    <StyledCozyFooter>
      <span className="cozy-round">
        {t("timer.roundProgress", { round, total })}
      </span>
    </StyledCozyFooter>
  );
};

export default React.memo(CozyFooter);
