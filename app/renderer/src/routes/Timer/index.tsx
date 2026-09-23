import { CounterContext } from "contexts";
import React, { useCallback, useContext } from "react";
import { useAppSelector } from "hooks/storeHooks";
import { StyledTimer, StyledTimerHeaderPad } from "styles";
import { AppLayout } from "store/settings/types";
import Control from "./Control";
import Counter from "./Counter";
import TimerHeader from "./TimerHeader";
import TimerStats from "./TimerStats";

export default function Timer() {
  const settings = useAppSelector((state) => state.settings);
  const timer = useAppSelector((state) => state.timer);
  const { resetTimerAction } = useContext(CounterContext);

  const onResetCallback = useCallback(() => {
    if (resetTimerAction) resetTimerAction();
  }, [resetTimerAction]);

  const isDashboard = settings.layout === AppLayout.DASHBOARD;

  return (
    <StyledTimer>
      {/* Classic has no tab bar; this is its only way back to the rest of the app. */}
      {!isDashboard && (
        <StyledTimerHeaderPad>
          <TimerHeader timerType={timer.timerType} />
        </StyledTimerHeaderPad>
      )}
      <Counter />
      <TimerStats />
      <Control resetTimerAction={onResetCallback} />
    </StyledTimer>
  );
}
