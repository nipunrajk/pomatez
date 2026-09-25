import type { PayloadAction } from "@reduxjs/toolkit";

export const enum EntryMode {
  STOPWATCH = "stopwatch",
  POMODORO = "pomodoro",
}

export type TimeEntry = {
  id: string;
  /** Local day the entry belongs to, `YYYY-MM-DD`. */
  date: string;
  title: string;
  tag: string;
  /** Planned start/end as `HH:MM`, or "" when not planned. */
  start: string;
  end: string;
  mode: EntryMode;
  /** Time tracked in finished runs, excluding the current run. */
  trackedMs: number;
  /** Epoch ms the current run started, or null when not running. */
  runningSince: number | null;
  createdAt: number;
  /** What this entry was started from, if anything (one at most). */
  calendarEventId?: string;
  boardCardId?: string;
  /** A Task List card, and the list (milestone) it belongs to. */
  taskCardId?: string;
  taskListId?: string;
  /** Focus periods that ran to the end while this entry was active. */
  focusSessions?: number;
};

export type EntriesState = {
  items: TimeEntry[];
  /** The entry Pomodoro focus time is credited to. */
  activeId: string | null;
};

export type EntryDraft = Pick<
  TimeEntry,
  "title" | "tag" | "start" | "end" | "mode" | "date"
> &
  Partial<
    Pick<
      TimeEntry,
      "calendarEventId" | "boardCardId" | "taskCardId" | "taskListId"
    >
  >;

export type EntryClockPayload = PayloadAction<{
  id: string;
  now: number;
}>;
