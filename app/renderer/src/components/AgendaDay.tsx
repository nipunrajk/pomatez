import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GOOGLE_CALENDAR_CANCEL,
  GOOGLE_CALENDAR_CONNECT,
  GOOGLE_CALENDAR_DISCONNECT,
} from "@pomatez/shareables";
import { getInvokeConnector } from "contexts";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  addEntry,
  CalendarEvent,
  EntryMode,
  setActiveEntry,
  setPlay,
  skipTimer,
  TimeEntry,
} from "store";
import { TimerStatus } from "store/timer/types";
import {
  StyledAgendaCard,
  StyledAgendaConfirm,
  StyledAgendaEvent,
  StyledAgendaMeta,
  StyledAgendaRow,
  StyledAgendaScroll,
  StyledAgendaTime,
  StyledButton,
  StyledButtonPrimary,
  StyledConnectCard,
  StyledCPEmpty,
  StyledCPLink,
} from "styles";
import SVG from "./SVG";

type Row =
  | { kind: "entry"; sort: string; entry: TimeEntry }
  | { kind: "event"; sort: string; event: CalendarEvent };

const pad = (n: number) => `${n}`.padStart(2, "0");
const hhmm = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

type Props = {
  /** `YYYY-MM-DD` */
  day: string;
  label: string;
  entries: TimeEntry[];
  events: CalendarEvent[];
  syncing: boolean;
};

/** One day's agenda: time entries and Google Calendar events, by time. */
const AgendaDay: React.FC<Props> = ({
  day,
  label,
  entries,
  events,
  syncing,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const calendar = useAppSelector((state) => state.calendar);
  const allEntries = useAppSelector((state) => state.entries.items);
  const timer = useAppSelector((state) => state.timer);
  const strict = useAppSelector(
    (state) => state.settings.enableStrictMode
  );
  const focusMinutes = useAppSelector(
    (state) => state.config.stayFocus
  );
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const send = (channel: string) => getInvokeConnector()?.send(channel);

  const rows = useMemo(() => {
    // An entry started from a listed event is shown by the event's card.
    const eventIds = new Set(events.map((e) => e.id));
    const list: Row[] = [
      ...entries
        .filter(
          (e) => !e.calendarEventId || !eventIds.has(e.calendarEventId)
        )
        .map(
          (entry): Row => ({
            kind: "entry",
            // Planned entries by start time; unplanned ones last.
            sort: entry.start || "99:99",
            entry,
          })
        ),
      ...events.map(
        (event): Row => ({
          kind: "event",
          // All-day events first.
          sort: event.allDay ? "" : hhmm(new Date(event.start)),
          event,
        })
      ),
    ];
    return list.sort((a, b) => a.sort.localeCompare(b.sort));
  }, [entries, events]);

  const [y, m, d] = day.split("-").map(Number);
  const timeLabel = (hours: number, minutes: number) =>
    new Date(y, m - 1, d, hours, minutes).toLocaleTimeString(
      i18n.language,
      { hour: "numeric", minute: "2-digit" }
    );

  const durationLabel = (event: CalendarEvent) => {
    const minutes = Math.max(
      0,
      Math.round(
        (new Date(event.end).getTime() -
          new Date(event.start).getTime()) /
          60000
      )
    );
    const h = Math.floor(minutes / 60);
    const min = minutes % 60;
    if (h === 0)
      return t("controlPanel.durationMinutes", { count: min });
    if (min === 0) return t("controlPanel.durationHours", { count: h });
    return t("controlPanel.durationHoursMinutes", { h, m: min });
  };

  const eventTitle = (event: CalendarEvent) =>
    event.title || t("controlPanel.untitledEvent");

  /**
   * Starts a Pomodoro credited to this event: reuses the time entry
   * linked to it (or creates one), like the Day page's play button.
   */
  const startFocus = (event: CalendarEvent) => {
    let id = allEntries.find((e) => e.calendarEventId === event.id)?.id;
    if (!id) {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const sameDay = !event.allDay && hhmm(end) > hhmm(start);
      id = dispatch(
        addEntry({
          title: eventTitle(event),
          tag: "",
          date: event.date,
          start: event.allDay ? "" : hhmm(start),
          end: sameDay ? hhmm(end) : "",
          mode: EntryMode.POMODORO,
          calendarEventId: event.id,
        })
      ).payload.id;
    }
    // Strict mode can't leave a running break early.
    if (
      timer.timerType !== TimerStatus.STAY_FOCUS &&
      !(strict && timer.playing)
    ) {
      dispatch(skipTimer(TimerStatus.STAY_FOCUS));
    }
    dispatch(setActiveEntry({ id, now: Date.now() }));
    if (!timer.playing) dispatch(setPlay(true));
    setConfirmId(null);
  };

  const errorText = calendar.error
    ? t(`controlPanel.calendarError_${calendar.error}`)
    : "";

  const showConnect =
    calendar.available && calendar.configured && !calendar.connected;

  const connectCard = (
    <StyledConnectCard>
      <div>
        <SVG name="calendar" />
        <h4>{t("controlPanel.connectCalendar")}</h4>
      </div>
      <p>{t("controlPanel.connectCalendarSub")}</p>
      {calendar.pending ? (
        <div className="connect-actions">
          <StyledButtonPrimary disabled>
            {t("controlPanel.waitingForGoogle")}
          </StyledButtonPrimary>
          <StyledButton onClick={() => send(GOOGLE_CALENDAR_CANCEL)}>
            {t("controlPanel.cancel")}
          </StyledButton>
        </div>
      ) : (
        <div className="connect-actions">
          <StyledButtonPrimary
            onClick={() => send(GOOGLE_CALENDAR_CONNECT)}
          >
            <SVG name="globe" />
            {t("controlPanel.signInWithGoogle")}
          </StyledButtonPrimary>
        </div>
      )}
      <p role="status" className="connect-status">
        {errorText}
      </p>
    </StyledConnectCard>
  );

  return (
    <>
      <h3>
        {t("controlPanel.agenda")} · {label}
      </h3>
      {calendar.connected && (
        <StyledAgendaMeta>
          <span title={calendar.email || undefined}>
            {calendar.email || t("controlPanel.googleCalendar")}
          </span>
          <span role="status">
            {syncing
              ? t("controlPanel.syncing")
              : calendar.error === "network"
              ? t("controlPanel.calendarError_network")
              : ""}
          </span>
          <StyledCPLink
            onClick={() => send(GOOGLE_CALENDAR_DISCONNECT)}
          >
            {t("controlPanel.disconnect")}
          </StyledCPLink>
        </StyledAgendaMeta>
      )}

      <StyledAgendaScroll>
        {rows.length === 0 ? (
          showConnect ? (
            connectCard
          ) : (
            <StyledCPEmpty>
              {t(
                calendar.connected
                  ? "controlPanel.noAgendaConnected"
                  : "controlPanel.noAgenda"
              )}
            </StyledCPEmpty>
          )
        ) : (
          <>
            <ul>
              {rows.map((row) => {
                if (row.kind === "entry") {
                  const { entry } = row;
                  const [h, min] = entry.start.split(":").map(Number);
                  return (
                    <StyledAgendaRow key={`entry-${entry.id}`}>
                      <StyledAgendaTime>
                        {entry.start
                          ? timeLabel(h, min)
                          : t("controlPanel.unplanned")}
                      </StyledAgendaTime>
                      <StyledAgendaEvent
                        pomodoro={entry.mode === EntryMode.POMODORO}
                      >
                        <strong>{entry.title}</strong>
                        <span>
                          {entry.start && entry.end
                            ? `${entry.start}–${entry.end}`
                            : t("controlPanel.unplanned")}
                          {entry.tag && ` · ${entry.tag}`}
                        </span>
                      </StyledAgendaEvent>
                    </StyledAgendaRow>
                  );
                }
                const { event } = row;
                const start = new Date(event.start);
                const open = confirmId === event.id;
                const confirmDomId = `agenda-confirm-${event.id}`;
                return (
                  <StyledAgendaRow key={`event-${event.id}`}>
                    <StyledAgendaTime>
                      {event.allDay
                        ? t("controlPanel.allDay")
                        : timeLabel(
                            start.getHours(),
                            start.getMinutes()
                          )}
                    </StyledAgendaTime>
                    <div>
                      <StyledAgendaCard
                        type="button"
                        tone={event.colorTheme}
                        aria-expanded={open}
                        aria-controls={open ? confirmDomId : undefined}
                        onClick={() =>
                          setConfirmId(open ? null : event.id)
                        }
                      >
                        <strong>{eventTitle(event)}</strong>
                        <span>
                          {event.allDay
                            ? t("controlPanel.allDay")
                            : durationLabel(event)}
                        </span>
                      </StyledAgendaCard>
                      {open && (
                        <StyledAgendaConfirm id={confirmDomId}>
                          <StyledButtonPrimary
                            aria-label={t(
                              "controlPanel.startEventPomodoroLabel",
                              {
                                minutes: focusMinutes,
                                title: eventTitle(event),
                              }
                            )}
                            onClick={() => startFocus(event)}
                          >
                            <SVG name="play" />
                            {t("controlPanel.startEventPomodoro", {
                              minutes: focusMinutes,
                            })}
                          </StyledButtonPrimary>
                          <StyledButton
                            onClick={() => setConfirmId(null)}
                          >
                            {t("controlPanel.cancel")}
                          </StyledButton>
                        </StyledAgendaConfirm>
                      )}
                    </div>
                  </StyledAgendaRow>
                );
              })}
            </ul>
            {showConnect && (
              <StyledAgendaMeta>
                <StyledCPLink
                  onClick={() =>
                    send(
                      calendar.pending
                        ? GOOGLE_CALENDAR_CANCEL
                        : GOOGLE_CALENDAR_CONNECT
                    )
                  }
                >
                  {calendar.pending
                    ? t("controlPanel.cancelWaiting")
                    : t("controlPanel.connectCalendar")}
                </StyledCPLink>
                <span role="status">{errorText}</span>
              </StyledAgendaMeta>
            )}
          </>
        )}
      </StyledAgendaScroll>
    </>
  );
};

export default AgendaDay;
