import { createSlice } from "@reduxjs/toolkit";
import { getFromStorage } from "utils";
import {
  HistoryState,
  RecordFocusSessionAction,
  RecordActivitySampleAction,
} from "./types";
import {
  createEmptyBucket,
  distributeAcrossHours,
  getDayKey,
  pruneOldDays,
} from "./utils";

export * from "./types";

const persisted = getFromStorage("state");
const days =
  (persisted && persisted.history && persisted.history.days) || {};

const initialState: HistoryState = { days };

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    recordFocusSession(state, action: RecordFocusSessionAction) {
      const { completedAt, durationMinutes } = action.payload;
      const startMs = completedAt - durationMinutes * 60 * 1000;

      distributeAcrossHours(state.days, startMs, completedAt);

      const dayKey = getDayKey(completedAt);
      if (!state.days[dayKey]) {
        state.days[dayKey] = createEmptyBucket();
      }
      state.days[dayKey].focusMinutes += durationMinutes;
      state.days[dayKey].sessions += 1;

      state.days = pruneOldDays(state.days);
    },

    recordActivitySample(state, action: RecordActivitySampleAction) {
      const { appName, domain, timestamp, sampleSeconds } =
        action.payload;
      const minutes = sampleSeconds / 60;

      const dayKey = getDayKey(timestamp);
      if (!state.days[dayKey]) {
        state.days[dayKey] = createEmptyBucket();
      }

      const bucket = state.days[dayKey];
      bucket.appMinutes[appName] =
        (bucket.appMinutes[appName] || 0) + minutes;

      if (domain) {
        bucket.siteMinutes[domain] =
          (bucket.siteMinutes[domain] || 0) + minutes;
      }

      state.days = pruneOldDays(state.days);
    },
  },
});

export const { recordFocusSession, recordActivitySample } =
  historySlice.actions;

export default historySlice.reducer;
