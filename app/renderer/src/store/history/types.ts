import type { PayloadAction } from "@reduxjs/toolkit";

export type DailyBucket = {
  focusMinutes: number;
  sessions: number;
  hourly: number[];
  appMinutes: Record<string, number>;
  siteMinutes: Record<string, number>;
};

export type HistoryState = {
  days: Record<string, DailyBucket>;
};

export type RecordFocusSessionPayload = {
  completedAt: number;
  durationMinutes: number;
};

export type RecordActivitySamplePayload = {
  appName: string;
  domain?: string;
  timestamp: number;
  sampleSeconds: number;
};

export type RecordFocusSessionAction =
  PayloadAction<RecordFocusSessionPayload>;

export type RecordActivitySampleAction =
  PayloadAction<RecordActivitySamplePayload>;
