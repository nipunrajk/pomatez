import { TimeEntry } from "./types";

export const getEntryElapsedMs = (entry: TimeEntry, now: number) =>
  entry.trackedMs +
  (entry.runningSince !== null
    ? Math.max(0, now - entry.runningSince)
    : 0);

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Planned duration in ms, or null if the entry has no valid time range. */
export const getPlannedMs = (entry: TimeEntry): number | null => {
  if (!entry.start || !entry.end) return null;
  const minutes = toMinutes(entry.end) - toMinutes(entry.start);
  return minutes > 0 ? minutes * 60 * 1000 : null;
};

export const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => `${n}`.padStart(2, "0"))
    .join(":");
};
