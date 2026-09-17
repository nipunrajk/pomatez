import { DailyBucket } from "./types";

export const RETENTION_DAYS = 90;

export const getDayKey = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const createEmptyBucket = (): DailyBucket => ({
  focusMinutes: 0,
  sessions: 0,
  hourly: new Array(24).fill(0),
  appMinutes: {},
  siteMinutes: {},
});

export const pruneOldDays = (
  days: Record<string, DailyBucket>,
  retentionDays: number = RETENTION_DAYS
): Record<string, DailyBucket> => {
  const cutoffKey = getDayKey(
    Date.now() - retentionDays * 24 * 60 * 60 * 1000
  );

  const pruned: Record<string, DailyBucket> = {};
  for (const key in days) {
    if (key >= cutoffKey) {
      pruned[key] = days[key];
    }
  }
  return pruned;
};

/**
 * Distributes a session's duration across the per-hour buckets of every
 * day it touches, splitting proportionally at hour (and day) boundaries.
 */
export const distributeAcrossHours = (
  days: Record<string, DailyBucket>,
  startMs: number,
  endMs: number
): void => {
  let cursor = startMs;

  while (cursor < endMs) {
    const cursorDate = new Date(cursor);
    const hour = cursorDate.getHours();

    const nextHourBoundary = new Date(cursorDate);
    nextHourBoundary.setMinutes(0, 0, 0);
    nextHourBoundary.setHours(hour + 1);

    const segmentEnd = Math.min(endMs, nextHourBoundary.getTime());
    const minutes = (segmentEnd - cursor) / (60 * 1000);

    const dayKey = getDayKey(cursor);
    if (!days[dayKey]) {
      days[dayKey] = createEmptyBucket();
    }
    days[dayKey].hourly[hour] += minutes;

    cursor = segmentEnd;
  }
};
