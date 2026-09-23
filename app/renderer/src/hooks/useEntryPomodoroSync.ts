import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./storeHooks";
import { EntryMode, startEntryClock, stopEntryClock } from "store";
import { TimerStatus } from "store/timer/types";

/**
 * Runs the active Pomodoro entry's clock only while the Pomodoro timer is
 * playing a focus period, so breaks and pauses aren't credited to it.
 */
export const useEntryPomodoroSync = () => {
  const dispatch = useAppDispatch();
  const playing = useAppSelector((state) => state.timer.playing);
  const timerType = useAppSelector((state) => state.timer.timerType);
  const activeEntry = useAppSelector((state) =>
    state.entries.items.find((e) => e.id === state.entries.activeId)
  );

  const isPomodoroEntry = activeEntry?.mode === EntryMode.POMODORO;
  const entryId = activeEntry?.id;
  const isRunning = activeEntry?.runningSince != null;
  const shouldRun = playing && timerType === TimerStatus.STAY_FOCUS;

  useEffect(() => {
    if (!entryId || !isPomodoroEntry) return;
    if (shouldRun && !isRunning) {
      dispatch(startEntryClock({ id: entryId, now: Date.now() }));
    } else if (!shouldRun && isRunning) {
      dispatch(stopEntryClock({ id: entryId, now: Date.now() }));
    }
  }, [dispatch, entryId, isPomodoroEntry, isRunning, shouldRun]);
};
