import { useCallback, useEffect } from "react";
import { GOOGLE_CALENDAR_FETCH } from "@pomatez/shareables";
import { getInvokeConnector } from "contexts";
import { getDayKey } from "store/history/utils";
import { setCalendarLoading } from "store";
import { useAppDispatch, useAppSelector } from "./storeHooks";

const RESYNC_MS = 10 * 60 * 1000;

/**
 * Google Calendar events for the week starting at `weekStart` (a local
 * Monday). While connected it syncs on mount, when the week changes, after
 * connecting, every 10 minutes and when the window regains focus.
 */
export const useCalendarWeek = (weekStart: Date) => {
  const dispatch = useAppDispatch();
  const connected = useAppSelector((state) => state.calendar.connected);
  const key = getDayKey(weekStart.getTime());
  const events = useAppSelector(
    (state) => state.calendar.eventsByWeek[key]
  );
  const loading = useAppSelector((state) =>
    state.calendar.loadingWeeks.includes(key)
  );

  const sync = useCallback(() => {
    const connector = getInvokeConnector();
    if (!connector || !connected) return;
    const [y, m, d] = key.split("-").map(Number);
    dispatch(setCalendarLoading(key));
    connector.send(GOOGLE_CALENDAR_FETCH, {
      key,
      timeMin: new Date(y, m - 1, d).toISOString(),
      timeMax: new Date(y, m - 1, d + 7).toISOString(),
    });
  }, [dispatch, connected, key]);

  useEffect(() => {
    if (!connected) return;
    sync();
    const interval = setInterval(sync, RESYNC_MS);
    window.addEventListener("focus", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", sync);
    };
  }, [connected, sync]);

  return { events: events || [], loading };
};
