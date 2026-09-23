import React from "react";
import { TimerStatus } from "store/timer/types";
import { StyledCounterTimer } from "styles";

type Props = {
  timerType?: TimerStatus;
  hours: string;
  minutes: string;
  seconds: string;
};

const CounterTimer: React.FC<Props> = ({
  timerType,
  hours,
  minutes,
  seconds,
}) => {
  return (
    <StyledCounterTimer hours={hours} type={timerType}>
      {Number(hours) > 0 && (
        <>
          <span>{hours}</span>
          <span>:</span>
        </>
      )}
      <span>{minutes}</span>
      <span>:</span>
      <span>{seconds}</span>
    </StyledCounterTimer>
  );
};

export default React.memo(CounterTimer);
