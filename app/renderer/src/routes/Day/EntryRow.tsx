import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SVG } from "components";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  deleteEntry,
  EntryMode,
  formatDuration,
  getEntryElapsedMs,
  getPlannedMs,
  setActiveEntry,
  setPlay,
  startEntryClock,
  stopEntryClock,
  TimeEntry,
} from "store";
import { TimerStatus } from "store/timer/types";
import {
  StyledEntryActions,
  StyledEntryDuration,
  StyledEntryModeChip,
  StyledEntryPlay,
  StyledEntryProgress,
  StyledEntryRange,
  StyledEntryRow,
  StyledEntryText,
  StyledIconButton,
} from "styles";

type Props = {
  entry: TimeEntry;
  now: number;
  onEdit: () => void;
};

const EntryRow: React.FC<Props> = ({ entry, now, onEdit }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const timer = useAppSelector((state) => state.timer);
  const strictMode = useAppSelector(
    (state) => state.settings.enableStrictMode
  );
  const activeEntry = useAppSelector((state) =>
    state.entries.items.find((e) => e.id === state.entries.activeId)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const timeout = setTimeout(() => setConfirmDelete(false), 3000);
    return () => clearTimeout(timeout);
  }, [confirmDelete]);

  const isPomodoro = entry.mode === EntryMode.POMODORO;
  const isActive = activeEntry?.id === entry.id;
  const clockRunning = entry.runningSince !== null;
  // A Pomodoro entry is "on" for the whole session, breaks included.
  const isOn = isPomodoro ? isActive && timer.playing : clockRunning;
  const onBreak =
    isPomodoro && isOn && timer.timerType !== TimerStatus.STAY_FOCUS;
  const cannotPause = isPomodoro && isOn && strictMode;

  const elapsed = getEntryElapsedMs(entry, now);
  const planned = getPlannedMs(entry);
  const percent =
    planned !== null ? Math.min(100, (elapsed / planned) * 100) : null;

  const onToggle = () => {
    const at = Date.now();

    if (!isPomodoro) {
      if (clockRunning) {
        dispatch(stopEntryClock({ id: entry.id, now: at }));
        return;
      }
      // Stop the Pomodoro timer if it was tracking a different entry.
      if (
        activeEntry?.mode === EntryMode.POMODORO &&
        timer.playing &&
        !strictMode
      ) {
        dispatch(setPlay(false));
      }
      dispatch(startEntryClock({ id: entry.id, now: at }));
      return;
    }

    if (isOn) {
      if (!strictMode) dispatch(setPlay(false));
      return;
    }
    dispatch(setActiveEntry({ id: entry.id, now: at }));
    if (!timer.playing) dispatch(setPlay(true));
  };

  const accent = isOn
    ? "var(--color-primary)"
    : isPomodoro
    ? "var(--color-pink)"
    : "var(--color-green)";

  return (
    <StyledEntryRow running={isOn} accent={accent}>
      <StyledEntryRange>
        {entry.start || entry.end ? (
          <>
            {entry.start || "--:--"} <span>—</span>{" "}
            {entry.end || "--:--"}
          </>
        ) : (
          <span>{t("day.unplanned")}</span>
        )}
      </StyledEntryRange>

      <div className="accent" />

      <StyledEntryText>
        <small>
          {entry.tag || t("day.noTag")}
          <StyledEntryModeChip pomodoro={isPomodoro}>
            {onBreak ? t("day.onBreak") : t(`day.mode_${entry.mode}`)}
          </StyledEntryModeChip>
        </small>
        <p title={entry.title}>{entry.title}</p>
      </StyledEntryText>

      <StyledEntryProgress
        percent={percent}
        done={percent !== null && percent >= 100}
        title={
          planned !== null
            ? `${formatDuration(elapsed)} / ${formatDuration(planned)}`
            : undefined
        }
      />

      <StyledEntryDuration running={clockRunning}>
        {formatDuration(elapsed)}
        {planned !== null && <small>/ {formatDuration(planned)}</small>}
      </StyledEntryDuration>

      <StyledEntryPlay
        type="button"
        running={isOn}
        disabled={cannotPause}
        title={
          cannotPause
            ? t("day.strictMode")
            : isOn
            ? t("day.pause")
            : t("day.start_tracking")
        }
        onClick={onToggle}
      >
        {/* The app's play/pause icons carry their own ring; use solid glyphs. */}
        <svg viewBox="0 0 12 12" aria-hidden="true">
          {isOn ? (
            <>
              <rect x="2.5" y="1.5" width="2.4" height="9" rx="0.8" />
              <rect x="7.1" y="1.5" width="2.4" height="9" rx="0.8" />
            </>
          ) : (
            <path d="M3.4 1.9v8.2a.7.7 0 0 0 1.05.6l6.4-4.1a.7.7 0 0 0 0-1.2L4.45 1.3a.7.7 0 0 0-1.05.6z" />
          )}
        </svg>
      </StyledEntryPlay>

      <StyledEntryActions>
        <StyledIconButton
          type="button"
          title={t("day.edit")}
          onClick={onEdit}
        >
          <SVG name="pencil" />
        </StyledIconButton>
        <StyledIconButton
          type="button"
          danger={confirmDelete}
          title={
            confirmDelete ? t("day.confirmDelete") : t("day.delete")
          }
          onClick={() =>
            confirmDelete
              ? dispatch(deleteEntry(entry.id))
              : setConfirmDelete(true)
          }
        >
          <SVG name="trash" />
        </StyledIconButton>
      </StyledEntryActions>
    </StyledEntryRow>
  );
};

export default React.memo(EntryRow);
