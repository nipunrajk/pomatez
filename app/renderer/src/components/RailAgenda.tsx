import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "hooks/storeHooks";
import { getDayKey } from "store/history/utils";
import { TimeEntry } from "store/entries/types";
import { useCalendarWeek } from "hooks/useCalendarWeek";
import {
  StyledAgenda,
  StyledCalendarDay,
  StyledCalendarGrid,
  StyledCalendarHeader,
  StyledRailCalendar,
  StyledRoundButton,
} from "styles";
import AgendaDay from "./AgendaDay";
import SVG from "./SVG";

const byStartThenCreated = (a: TimeEntry, b: TimeEntry) =>
  (a.start || "99:99").localeCompare(b.start || "99:99") ||
  a.createdAt - b.createdAt;

/** Monday 00:00 of the week containing `date`. */
const startOfWeek = (date: Date) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - ((date.getDay() + 6) % 7)
  );

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** One-week strip (current week by default) + that day's agenda. */
const RailAgenda: React.FC = () => {
  const { t, i18n } = useTranslation();
  const entries = useAppSelector((state) => state.entries.items);

  const today = new Date();
  const todayKey = getDayKey(today.getTime());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const [selected, setSelected] = useState(todayKey);

  const days = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStart, i)
  );
  const weekEnd = days[6];

  const { events: weekEvents, loading } = useCalendarWeek(weekStart);

  const daysWithEntries = useMemo(
    () =>
      new Set([
        ...entries.map((entry) => entry.date),
        ...weekEvents.map((event) => event.date),
      ]),
    [entries, weekEvents]
  );
  const dayEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.date === selected)
        .sort(byStartThenCreated),
    [entries, selected]
  );
  const dayEvents = useMemo(
    () => weekEvents.filter((event) => event.date === selected),
    [weekEvents, selected]
  );

  // Keep the same weekday selected when paging weeks.
  const shiftWeek = (delta: number) => {
    const [y, m, d] = selected.split("-").map(Number);
    setSelected(
      getDayKey(addDays(new Date(y, m - 1, d), delta * 7).getTime())
    );
    setWeekStart((start) => addDays(start, delta * 7));
  };

  const month = (date: Date, withYear: boolean) =>
    date.toLocaleDateString(i18n.language, {
      month: "long",
      ...(withYear && { year: "numeric" }),
    });
  const title =
    weekStart.getMonth() === weekEnd.getMonth()
      ? month(weekStart, true)
      : weekStart.getFullYear() === weekEnd.getFullYear()
      ? `${month(weekStart, false)} – ${month(weekEnd, true)}`
      : `${month(weekStart, true)} – ${month(weekEnd, true)}`;

  const [sy, sm, sd] = selected.split("-").map(Number);
  const selectedLabel = new Date(sy, sm - 1, sd).toLocaleDateString(
    i18n.language,
    { weekday: "short", month: "short", day: "numeric" }
  );

  return (
    <StyledRailCalendar>
      <StyledCalendarHeader>
        <h3 aria-live="polite">{title}</h3>
        <StyledRoundButton
          size="sm"
          aria-label={t("controlPanel.previousWeek")}
          onClick={() => shiftWeek(-1)}
        >
          <SVG name="arrow-left" />
        </StyledRoundButton>
        <StyledRoundButton
          size="sm"
          aria-label={t("controlPanel.nextWeek")}
          onClick={() => shiftWeek(1)}
        >
          <SVG name="arrow-right" />
        </StyledRoundButton>
      </StyledCalendarHeader>

      <StyledCalendarGrid>
        {days.map((date) => (
          <abbr
            key={`w-${date.getDay()}`}
            title={date.toLocaleDateString(i18n.language, {
              weekday: "long",
            })}
          >
            {date.toLocaleDateString(i18n.language, {
              weekday: "narrow",
            })}
          </abbr>
        ))}
        {days.map((date) => {
          const key = getDayKey(date.getTime());
          return (
            <StyledCalendarDay
              key={key}
              selected={key === selected}
              today={key === todayKey}
              hasEntries={daysWithEntries.has(key)}
              aria-pressed={key === selected}
              aria-current={key === todayKey ? "date" : undefined}
              aria-label={date.toLocaleDateString(i18n.language, {
                dateStyle: "full",
              })}
              onClick={() => setSelected(key)}
            >
              {date.getDate()}
            </StyledCalendarDay>
          );
        })}
      </StyledCalendarGrid>

      <StyledAgenda aria-label={t("controlPanel.agenda")}>
        <AgendaDay
          day={selected}
          label={selectedLabel}
          entries={dayEntries}
          events={dayEvents}
          syncing={loading}
        />
      </StyledAgenda>
    </StyledRailCalendar>
  );
};

export default React.memo(RailAgenda);
