import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFromStorage } from "utils";
import { recordFocusSession } from "store/history";
import {
  EntriesState,
  EntryClockPayload,
  EntryDraft,
  EntryMode,
  TimeEntry,
} from "./types";

export * from "./types";
export * from "./utils";

const stopClock = (entry: TimeEntry, now: number) => {
  if (entry.runningSince !== null) {
    entry.trackedMs += Math.max(0, now - entry.runningSince);
    entry.runningSince = null;
  }
};

const loadInitialState = (): EntriesState => {
  const persisted = getFromStorage("state")?.entries as
    | EntriesState
    | undefined;
  if (!persisted || !Array.isArray(persisted.items)) {
    return { items: [], activeId: null };
  }
  // A stopwatch keeps running while the app is closed, like other time
  // trackers. Pomodoro time can't be known across restarts (the Pomodoro
  // timer itself resets), so drop the unconfirmed run.
  const items = persisted.items.map((entry) =>
    entry.mode === EntryMode.POMODORO
      ? { ...entry, runningSince: null }
      : entry
  );
  return { items, activeId: persisted.activeId ?? null };
};

const entriesSlice = createSlice({
  name: "entries",
  initialState: loadInitialState(),
  reducers: {
    addEntry: {
      reducer(state, action: PayloadAction<TimeEntry>) {
        state.items.push(action.payload);
      },
      prepare(draft: EntryDraft) {
        const now = Date.now();
        return {
          payload: {
            ...draft,
            id: `${now.toString(36)}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
            trackedMs: 0,
            runningSince: null,
            createdAt: now,
          },
        };
      },
    },

    updateEntry(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<EntryDraft>;
      }>
    ) {
      const entry = state.items.find((e) => e.id === action.payload.id);
      if (!entry) return;
      const { changes } = action.payload;
      if (changes.mode && changes.mode !== entry.mode) {
        // Switching modes mid-run would mix the two tracking rules.
        stopClock(entry, Date.now());
      }
      Object.assign(entry, changes);
    },

    deleteEntry(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload);
      if (state.activeId === action.payload) state.activeId = null;
    },

    /** Starts an entry's clock; only one entry runs at a time. */
    startEntryClock(state, action: EntryClockPayload) {
      const { id, now } = action.payload;
      state.items.forEach((entry) => {
        if (entry.id === id) {
          if (entry.runningSince === null) entry.runningSince = now;
        } else {
          stopClock(entry, now);
        }
      });
      state.activeId = id;
    },

    stopEntryClock(state, action: EntryClockPayload) {
      const entry = state.items.find((e) => e.id === action.payload.id);
      if (entry) stopClock(entry, action.payload.now);
    },

    /** Makes an entry active without starting its clock, stopping others. */
    setActiveEntry(
      state,
      action: PayloadAction<{ id: string | null; now: number }>
    ) {
      const { id, now } = action.payload;
      state.items.forEach((entry) => {
        if (entry.id !== id) stopClock(entry, now);
      });
      state.activeId = id;
    },
  },
  extraReducers: (builder) => {
    // A focus period that ran to the end counts for the active Pomodoro
    // entry (the completed-Pomodoro count on linked board cards).
    builder.addCase(recordFocusSession, (state) => {
      const entry = state.items.find((e) => e.id === state.activeId);
      if (entry && entry.mode === EntryMode.POMODORO) {
        entry.focusSessions = (entry.focusSessions || 0) + 1;
      }
    });
  },
});

export const {
  addEntry,
  updateEntry,
  deleteEntry,
  startEntryClock,
  stopEntryClock,
  setActiveEntry,
} = entriesSlice.actions;

export default entriesSlice.reducer;
