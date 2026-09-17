import { useMemo, useState } from "react";
import { useAppSelector } from "hooks/storeHooks";
import { DailyBucket } from "store";
import { getDayKey } from "store/history/utils";

export type RangeMode = "today" | "7d" | "range";

export type ActivityEntry = {
  name: string;
  minutes: number;
  percent: number;
};

export type ChartBucket = {
  label: string;
  minutes: number;
};

export type StatsResult = {
  rangeMode: RangeMode;
  setRangeMode: (mode: RangeMode) => void;
  rangeStart: string;
  rangeEnd: string;
  setRangeStart: (value: string) => void;
  setRangeEnd: (value: string) => void;
  focusMinutes: number;
  sessions: number;
  streakDays: number;
  topActivity: string | null;
  chartBuckets: ChartBucket[];
  appSplit: ActivityEntry[];
  browserActivity: ActivityEntry[];
};

const HOUR_LABELS = [
  "12a",
  "1a",
  "2a",
  "3a",
  "4a",
  "5a",
  "6a",
  "7a",
  "8a",
  "9a",
  "10a",
  "11a",
  "12p",
  "1p",
  "2p",
  "3p",
  "4p",
  "5p",
  "6p",
  "7p",
  "8p",
  "9p",
  "10p",
  "11p",
];

const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const parseDayKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getLast7DayKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    keys.push(getDayKey(date.getTime()));
  }
  return keys;
};

const getRangeDayKeys = (
  rangeStart: string,
  rangeEnd: string
): string[] => {
  const start = parseDayKey(rangeStart).getTime();
  const end = parseDayKey(rangeEnd).getTime();

  const cursor = new Date(Math.min(start, end));
  const last = new Date(Math.max(start, end));

  const keys: string[] = [];
  while (cursor.getTime() <= last.getTime()) {
    keys.push(getDayKey(cursor.getTime()));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};

const toSortedEntries = (
  totals: Record<string, number>
): ActivityEntry[] => {
  const total = Object.values(totals).reduce((sum, m) => sum + m, 0);

  return Object.entries(totals)
    .map(([name, minutes]) => ({
      name,
      minutes,
      percent: total > 0 ? (minutes / total) * 100 : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
};

const computeStreak = (
  days: Record<string, DailyBucket>,
  todayKey: string
): number => {
  const cursor = new Date();

  if (!days[todayKey] || days[todayKey].focusMinutes <= 0) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const key = getDayKey(cursor.getTime());
    const bucket = days[key];
    if (bucket && bucket.focusMinutes > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

export const useStats = (): StatsResult => {
  const days = useAppSelector((state) => state.history.days);

  const [rangeMode, setRangeMode] = useState<RangeMode>("today");

  const todayKey = getDayKey(Date.now());
  const [rangeStart, setRangeStart] = useState(todayKey);
  const [rangeEnd, setRangeEnd] = useState(todayKey);

  return useMemo(() => {
    const selectedKeys =
      rangeMode === "today"
        ? [todayKey]
        : rangeMode === "7d"
        ? getLast7DayKeys()
        : getRangeDayKeys(rangeStart, rangeEnd);

    const buckets = selectedKeys
      .map((key) => days[key])
      .filter((bucket): bucket is DailyBucket => Boolean(bucket));

    const focusMinutes = buckets.reduce(
      (sum, bucket) => sum + bucket.focusMinutes,
      0
    );
    const sessions = buckets.reduce(
      (sum, bucket) => sum + bucket.sessions,
      0
    );

    const appTotals: Record<string, number> = {};
    const siteTotals: Record<string, number> = {};

    buckets.forEach((bucket) => {
      Object.entries(bucket.appMinutes).forEach(([name, minutes]) => {
        appTotals[name] = (appTotals[name] || 0) + minutes;
      });
      Object.entries(bucket.siteMinutes).forEach(([name, minutes]) => {
        siteTotals[name] = (siteTotals[name] || 0) + minutes;
      });
    });

    const appSplit = toSortedEntries(appTotals);
    const browserActivity = toSortedEntries(siteTotals);
    const topActivity = appSplit[0]?.name ?? null;

    const streakDays = computeStreak(days, todayKey);

    const chartBuckets: ChartBucket[] =
      rangeMode === "today"
        ? (days[todayKey]?.hourly ?? new Array(24).fill(0)).map(
            (minutes, hour) => ({
              label: hour % 3 === 0 ? HOUR_LABELS[hour] : "",
              minutes,
            })
          )
        : selectedKeys.map((key) => {
            const date = parseDayKey(key);
            return {
              label: WEEKDAY_LABELS[date.getDay()],
              minutes: days[key]?.focusMinutes ?? 0,
            };
          });

    return {
      rangeMode,
      setRangeMode,
      rangeStart,
      rangeEnd,
      setRangeStart,
      setRangeEnd,
      focusMinutes,
      sessions,
      streakDays,
      topActivity,
      chartBuckets,
      appSplit,
      browserActivity,
    };
  }, [days, rangeMode, rangeStart, rangeEnd, todayKey]);
};
