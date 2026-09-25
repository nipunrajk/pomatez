/** Mirrors app/electron/src/helpers/googleCalendar.ts (what main sends). */
export type CalendarColorTheme =
  | "blue"
  | "sand"
  | "sage"
  | "mint"
  | "terracotta";

export type CalendarEvent = {
  id: string;
  title: string;
  /** Local day the event starts on, `YYYY-MM-DD`. */
  date: string;
  /** ISO date-time, or `YYYY-MM-DD` for all-day events. */
  start: string;
  end: string;
  allDay: boolean;
  colorTheme: CalendarColorTheme;
  link?: string;
};

export type CalendarError =
  | "config"
  | "encryption"
  | "denied"
  | "timeout"
  | "reauth"
  | "network";

export type CalendarStatus = {
  configured: boolean;
  connected: boolean;
  pending: boolean;
  email: string | null;
  error: CalendarError | null;
};

export type CalendarState = CalendarStatus & {
  /** Main process answered at least once (Electron only). */
  available: boolean;
  /** Events per week, keyed by the week's Monday `YYYY-MM-DD`. */
  eventsByWeek: Record<string, CalendarEvent[]>;
  loadingWeeks: string[];
  lastSyncedAt: number | null;
};
