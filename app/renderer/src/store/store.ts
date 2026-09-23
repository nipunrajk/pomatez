import { configureStore } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";

import { saveToStorage, getFromStorage } from "utils";
import configReducer from "./config";
import settingReducer from "./settings";
import timerReducer from "./timer";
import undoableTasksReducer from "./tasks";
import updateReducer from "./update";
import historyReducer from "./history";
import entriesReducer from "./entries";

export type AppStateTypes = ReturnType<typeof store.getState>;
export type AppDispatchTypes = typeof store.dispatch;

const store = configureStore({
  reducer: {
    config: configReducer,
    settings: settingReducer,
    timer: timerReducer,
    tasks: undoableTasksReducer,
    update: updateReducer,
    history: historyReducer,
    entries: entriesReducer,
  },
});

const getPersistedState = () => ({
  config: store.getState().config,
  settings: store.getState().settings,
  tasks: store.getState().tasks.present,
  history: store.getState().history,
  entries: store.getState().entries,
});

if (!getFromStorage("state")) {
  saveToStorage("state", getPersistedState());
}

store.subscribe(
  debounce(() => {
    saveToStorage("state", getPersistedState());
  }, 1000)
);

export default store;
