import { useCallback, useEffect, useState } from "react";
import WarningBell from "assets/audios/warning-bell.wav";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { setPlay, setRound, skipTimer } from "store";
import { TimerStatus } from "store/timer/types";

/**
 * Play/pause, reset and skip for the Pomodoro timer. In strict mode a
 * running timer can't be paused, reset or skipped: the action is refused
 * with a warning bell and `warn` is true for 3 seconds.
 */
export const useTimerControls = (resetTimerAction?: () => void) => {
  const dispatch = useAppDispatch();
  const timer = useAppSelector((state) => state.timer);
  const sessionRounds = useAppSelector(
    (state) => state.config.sessionRounds
  );
  const strict = useAppSelector(
    (state) => state.settings.enableStrictMode
  );

  const [warn, setWarn] = useState(false);

  const blocked = timer.playing && strict;

  const activateWarning = useCallback(() => {
    setWarn(true);
    new Audio(WarningBell).play().catch((e) => {
      console.warn("There was a problem playing sound", e);
    });
  }, []);

  const onReset = useCallback(() => {
    if (blocked) return activateWarning();
    if (resetTimerAction) resetTimerAction();
  }, [blocked, activateWarning, resetTimerAction]);

  const onPlay = useCallback(() => {
    if (blocked) return activateWarning();
    dispatch(setPlay(!timer.playing));
  }, [blocked, activateWarning, dispatch, timer.playing]);

  const onSkip = useCallback(() => {
    if (blocked) return activateWarning();

    switch (timer.timerType) {
      case TimerStatus.STAY_FOCUS:
        dispatch(
          skipTimer(
            timer.round < sessionRounds
              ? TimerStatus.SHORT_BREAK
              : TimerStatus.LONG_BREAK
          )
        );
        break;
      case TimerStatus.SHORT_BREAK:
        dispatch(skipTimer(TimerStatus.STAY_FOCUS));
        dispatch(setRound(timer.round + 1));
        break;
      case TimerStatus.LONG_BREAK:
        dispatch(skipTimer(TimerStatus.STAY_FOCUS));
        dispatch(setRound(1));
        break;
      case TimerStatus.SPECIAL_BREAK:
        dispatch(skipTimer(TimerStatus.STAY_FOCUS));
        break;
    }
    // Skipping starts the next phase.
    if (!timer.playing) dispatch(setPlay(true));
  }, [
    blocked,
    activateWarning,
    dispatch,
    timer.timerType,
    timer.round,
    timer.playing,
    sessionRounds,
  ]);

  useEffect(() => {
    if (!warn) return;
    const timeout = setTimeout(() => setWarn(false), 3000);
    return () => clearTimeout(timeout);
  }, [warn]);

  return { warn, onPlay, onReset, onSkip };
};
