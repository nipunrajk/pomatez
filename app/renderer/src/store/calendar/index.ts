import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent, CalendarState, CalendarStatus } from "./types";

export * from "./types";

// Not persisted: calendar data stays in memory and is refetched from main.
const initialState: CalendarState = {
  available: false,
  configured: false,
  connected: false,
  pending: false,
  email: null,
  error: null,
  eventsByWeek: {},
  loadingWeeks: [],
  lastSyncedAt: null,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setCalendarStatus(state, action: PayloadAction<CalendarStatus>) {
      const wasConnected = state.connected;
      Object.assign(state, action.payload, { available: true });
      if (wasConnected && !action.payload.connected) {
        state.eventsByWeek = {};
        state.loadingWeeks = [];
        state.lastSyncedAt = null;
      }
    },

    setCalendarLoading(state, action: PayloadAction<string>) {
      if (!state.loadingWeeks.includes(action.payload)) {
        state.loadingWeeks.push(action.payload);
      }
    },

    setCalendarEvents(
      state,
      action: PayloadAction<{ key: string; events: CalendarEvent[] }>
    ) {
      const { key, events } = action.payload;
      state.eventsByWeek[key] = events;
      state.loadingWeeks = state.loadingWeeks.filter((k) => k !== key);
      state.lastSyncedAt = Date.now();
    },
  },
});

export const {
  setCalendarStatus,
  setCalendarLoading,
  setCalendarEvents,
} = calendarSlice.actions;

export default calendarSlice.reducer;
