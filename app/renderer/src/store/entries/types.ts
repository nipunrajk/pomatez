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
  /** Google Calendar event this entry was started from, if any. */
  calendarEventId?: string;
};

export type EntriesState = {
  items: TimeEntry[];
  /** The entry Pomodoro focus time is credited to. */
  activeId: string | null;
};

export type EntryDraft = Pick<
  TimeEntry,
  "title" | "tag" | "start" | "end" | "mode" | "date"
> & { calendarEventId?: string };

export type EntryClockPayload = PayloadAction<{
  id: string;
  now: number;
}>;
