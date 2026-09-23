import React from "react";
import { useTranslation } from "react-i18next";
import { TimerStatus } from "store/timer/types";
import { StyledCounterLabel } from "styles";
import { getTimerPhaseLabelKey } from "../timerPhaseLabel";

type Props = {
  timerType?: TimerStatus;
};

const CounterLabel: React.FC<Props> = ({ timerType }) => {
  const { t } = useTranslation();

  return (
    <StyledCounterLabel>
      {t(getTimerPhaseLabelKey(timerType))}
    </StyledCounterLabel>
  );
};

export default React.memo(CounterLabel);
