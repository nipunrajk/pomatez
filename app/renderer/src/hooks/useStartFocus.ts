import { useCallback } from "react";
import {
  addEntry,
  EntryDraft,
  EntryMode,
  setActiveEntry,
  setPlay,
  skipTimer,
  TimeEntry,
} from "store";
import { TimerStatus } from "store/timer/types";
import { useAppDispatch, useAppSelector } from "./storeHooks";

type Link = Pick<
  EntryDraft,
  "calendarEventId" | "boardCardId" | "taskCardId" | "taskListId"
>;

const matches = (entry: TimeEntry, link: Link) =>
  (!!link.calendarEventId &&
    entry.calendarEventId === link.calendarEventId) ||
  (!!link.boardCardId && entry.boardCardId === link.boardCardId) ||
  (!!link.taskCardId && entry.taskCardId === link.taskCardId);

/**
 * Starts a Pomodoro credited to something (a calendar event, a board card,
 * a Task List card): reuses the time entry linked to it or creates one,
 * switches to focus, makes it the active entry and plays, like the Day
 * page's play button. useEntryPomodoroSync then credits the focus time.
 */
export const useStartFocus = () => {
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.entries.items);
  const timer = useAppSelector((state) => state.timer);
  const strict = useAppSelector(
    (state) => state.settings.enableStrictMode
  );

  return useCallback(
    (link: Link, draft: Omit<EntryDraft, keyof Link | "mode">) => {
      let id = entries.find((e) => matches(e, link))?.id;
      if (!id) {
        id = dispatch(
          addEntry({ ...draft, ...link, mode: EntryMode.POMODORO })
        ).payload.id;
      }
      // Strict mode can't leave a running break early.
      if (
        timer.timerType !== TimerStatus.STAY_FOCUS &&
        !(strict && timer.playing)
      ) {
        dispatch(skipTimer(TimerStatus.STAY_FOCUS));
      }
      dispatch(setActiveEntry({ id, now: Date.now() }));
      if (!timer.playing) dispatch(setPlay(true));
    },
    [dispatch, entries, timer.timerType, timer.playing, strict]
  );
};
