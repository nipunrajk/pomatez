import { CounterContext } from "contexts";
import React, { useCallback, useContext } from "react";
import { useAppSelector } from "hooks/storeHooks";
import { StyledTimer } from "styles";
import { AppLayout } from "store/settings/types";
import Control from "./Control";
import Counter from "./Counter";
import TimerHeader from "./TimerHeader";
import TimerStats from "./TimerStats";
import ClockDial from "./ClockDial/ClockDial";
import CozyFooter from "./CozyFooter";
import { StyledCozyTimer } from "styles/routes/timer/clockDial";

export default function Timer() {
  const settings = useAppSelector((state) => state.settings);
  const timer = useAppSelector((state) => state.timer);
  const { resetTimerAction, shouldFullscreen } = useContext(
    CounterContext
  );

  const onResetCallback = useCallback(() => {
    if (resetTimerAction) resetTimerAction();
  }, [resetTimerAction]);

  const isDashboard = settings.layout === AppLayout.DASHBOARD;

  if (!isDashboard) {
    return (
      <StyledCozyTimer className="compact">
        {shouldFullscreen ? (
          <Counter />
        ) : (
          <>
            <TimerHeader timerType={timer.timerType} />
            <ClockDial />
            <CozyFooter />
          </>
        )}
      </StyledCozyTimer>
    );
  }

  return (
    <StyledTimer>
      <Counter />
      <TimerStats />
      <Control resetTimerAction={onResetCallback} />
    </StyledTimer>
  );
}
