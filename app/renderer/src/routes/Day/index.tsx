import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SVG } from "components";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useNow } from "hooks/useNow";
import {
  addEntry,
  EntryDraft,
  EntryMode,
  formatDuration,
  getEntryElapsedMs,
  TimeEntry,
  updateEntry,
} from "store";
import { getDayKey } from "store/history/utils";
import {
  StyledButtonPrimary,
  StyledDay,
  StyledDayEmpty,
  StyledDayGroup,
  StyledDayGroupHeader,
  StyledDayTopBar,
  StyledDayTotal,
} from "styles";
import EntryForm from "./EntryForm";
import EntryRow from "./EntryRow";

const byStartThenCreated = (a: TimeEntry, b: TimeEntry) =>
  (a.start || "99:99").localeCompare(b.start || "99:99") ||
  a.createdAt - b.createdAt;

const toDraft = ({
  title,
  tag,
  start,
  end,
  mode,
  date,
}: TimeEntry) => ({
  title,
  tag,
  start,
  end,
  mode,
  date,
});

export default function Day() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const entries = useAppSelector((state) => state.entries.items);

  const now = useNow(entries.some((e) => e.runningSince !== null));
  const today = getDayKey(now);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const byDate = new Map<string, TimeEntry[]>([[today, []]]);
    entries.forEach((entry) => {
      const list = byDate.get(entry.date) ?? [];
      list.push(entry);
      byDate.set(entry.date, list);
    });
    return Array.from(byDate.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, list]) => ({
        date,
        entries: [...list].sort(byStartThenCreated),
      }));
  }, [entries, today]);

  const formatDay = (dayKey: string) => {
    const [y, m, d] = dayKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return {
      weekday: date.toLocaleDateString(i18n.language, {
        weekday: "short",
      }),
      rest: date.toLocaleDateString(i18n.language, {
        month: "long",
        day: "2-digit",
      }),
    };
  };

  const emptyDraft: EntryDraft = {
    title: "",
    tag: "",
    start: "",
    end: "",
    mode: EntryMode.STOPWATCH,
    date: today,
  };

  return (
    <StyledDay>
      <StyledDayTopBar>
        <h2>{t("day.heading")}</h2>
        <StyledButtonPrimary
          type="button"
          onClick={() => {
            setEditingId(null);
            setAdding(true);
          }}
        >
          <SVG name="add" />
          {t("day.add")}
        </StyledButtonPrimary>
      </StyledDayTopBar>

      {groups.map(({ date, entries: dayEntries }) => {
        const { weekday, rest } = formatDay(date);
        const totalMs = dayEntries.reduce(
          (sum, entry) => sum + getEntryElapsedMs(entry, now),
          0
        );

        return (
          <StyledDayGroup key={date}>
            <StyledDayGroupHeader>
              <h3>
                <strong>{weekday},</strong> {rest}
                {date === today && ` · ${t("day.today")}`}
              </h3>
              <StyledDayTotal>{formatDuration(totalMs)}</StyledDayTotal>
            </StyledDayGroupHeader>

            {date === today && adding && (
              <EntryForm
                initial={emptyDraft}
                submitLabel={t("day.add")}
                onCancel={() => setAdding(false)}
                onSubmit={(draft) => {
                  dispatch(addEntry(draft));
                  setAdding(false);
                }}
              />
            )}

            {dayEntries.length === 0 && !(date === today && adding) && (
              <StyledDayEmpty>{t("day.empty")}</StyledDayEmpty>
            )}

            {dayEntries.map((entry) =>
              editingId === entry.id ? (
                <EntryForm
                  key={entry.id}
                  initial={toDraft(entry)}
                  submitLabel={t("day.save")}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(changes) => {
                    dispatch(updateEntry({ id: entry.id, changes }));
                    setEditingId(null);
                  }}
                />
              ) : (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  now={now}
                  onEdit={() => {
                    setAdding(false);
                    setEditingId(entry.id);
                  }}
                />
              )
            )}
          </StyledDayGroup>
        );
      })}
    </StyledDay>
  );
}
