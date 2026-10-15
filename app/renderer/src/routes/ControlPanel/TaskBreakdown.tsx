import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Checkbox, SVG } from "components";
import { useAppSelector } from "hooks/storeHooks";
import { useBoardMilestoneSync } from "hooks/useBoardMilestoneSync";
import { useNow } from "hooks/useNow";
import { useStartFocus } from "hooks/useStartFocus";
import {
  BOARD_COLUMNS,
  MilestoneStatus,
} from "store";
import { getDayKey } from "store/history/utils";
import {
  StyledButtonSecondary,
  StyledCardFocus,
  StyledCPHeaderControls,
  StyledCPEmpty,
  StyledCPLink,
  StyledCPSection,
  StyledCPSectionHeader,
  StyledEntryProgress,
  StyledEntryTag,
  StyledMilestoneDeadline,
  StyledMilestoneRow,
  StyledMilestones,
  StyledRoundButton,
  StyledStatusTag,
  StyledSubtask,
  StyledSubtaskList,
  StyledToast,
} from "styles";
import MilestoneDialog, { MilestoneDialogTarget } from "./MilestoneDialog";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Each Task List list is a milestone: its cards are the tasks, and it has
 * optional category, status and deadline set from here.
 */
const TaskBreakdown: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const board = useAppSelector((state) => state.board);
  const { setSubtaskDone, sendToBoard, boardCardFor } =
    useBoardMilestoneSync();
  const lists = useAppSelector((state) => state.tasks.present);
  const entries = useAppSelector((state) => state.entries.items);
  const activeId = useAppSelector((state) => state.entries.activeId);
  const playing = useAppSelector((state) => state.timer.playing);
  const startLinkedFocus = useStartFocus();
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<MilestoneDialogTarget | null>(
    null
  );
  const closeDialog = useCallback(() => setDialog(null), []);
  const [toast, setToast] = useState("");
  const [justSent, setJustSent] = useState<string | null>(null);

  // The send button becomes "On board": keep keyboard focus on it.
  useEffect(() => {
    if (!justSent) return;
    document.getElementById(`on-board-${justSent}`)?.focus();
    setJustSent(null);
  }, [justSent]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const showOnBoard = (boardCardId: string) => {
    const el = document.querySelector<HTMLElement>(
      `[data-rbd-draggable-id="${CSS.escape(boardCardId)}"]`
    );
    el?.scrollIntoView({ block: "center", inline: "nearest" });
    el?.focus();
  };

  const linkedRunning = entries.some(
    (e) => e.taskListId && e.runningSince !== null
  );
  const now = useNow(linkedRunning);

  // Focus time per milestone: entries started from one of its subtasks,
  // or from a board card linked to it (even if linked afterwards).
  const loggedMs = useMemo(() => {
    const cardList: Record<string, string> = {};
    BOARD_COLUMNS.forEach((column) =>
      board.columns[column].forEach((card) => {
        if (card.taskListId) cardList[card.id] = card.taskListId;
      })
    );
    const byList: Record<string, number> = {};
    entries.forEach((e) => {
      const listId =
        e.taskListId || (e.boardCardId && cardList[e.boardCardId]);
      if (!listId) return;
      const running =
        e.runningSince !== null ? now - e.runningSince : 0;
      byList[listId] =
        (byList[listId] || 0) + e.trackedMs + Math.max(0, running);
    });
    return byList;
  }, [entries, board, now]);

  const counts = lists.reduce(
    (acc, list) => {
      acc[list.status || "ongoing"] += 1;
      return acc;
    },
    { ongoing: 0, review: 0, paused: 0 } as Record<
      MilestoneStatus,
      number
    >
  );

  const toggle = (id: string) =>
    setOpenIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  const todayKey = getDayKey(Date.now());
  const deadlineInfo = (deadline?: string) => {
    if (!deadline) return null;
    const [y, m, d] = deadline.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date(`${todayKey}T00:00`);
    const days = Math.round(
      (date.getTime() - today.getTime()) / DAY_MS
    );
    return {
      label: date.toLocaleDateString(i18n.language, {
        month: "long",
        day: "numeric",
      }),
      // Due within 3 days, or past due.
      soon: days <= 3,
      overdue: days < 0,
    };
  };

  const hours = (ms: number) =>
    t("controlPanel.hoursLogged", {
      hours: (Math.round((ms / 3600000) * 10) / 10).toLocaleString(
        i18n.language
      ),
    });

  return (
    <StyledCPSection $fill aria-labelledby="task-breakdown-title">
      <StyledCPSectionHeader>
        <div>
          <h3 id="task-breakdown-title">
            {t("controlPanel.breakdownTitle")}
          </h3>
          <p>
            {t(
              counts.review
                ? "controlPanel.breakdownSubReview"
                : "controlPanel.breakdownSub",
              counts
            )}
          </p>
        </div>
        <StyledCPHeaderControls>
          <StyledButtonSecondary
            onClick={(e) => {
              e.currentTarget.focus();
              setDialog({ mode: "create" });
            }}
          >
            <SVG name="add" />
            {t("controlPanel.newMilestone")}
          </StyledButtonSecondary>
          <StyledCPLink onClick={() => history.push("/task-list")}>
            {t("controlPanel.seeEverything")}
            <SVG name="arrow-up-right" />
          </StyledCPLink>
        </StyledCPHeaderControls>
      </StyledCPSectionHeader>

      {lists.length === 0 ? (
        <StyledCPEmpty>{t("controlPanel.noTasks")}</StyledCPEmpty>
      ) : (
        <StyledMilestones>
          {lists.map((list) => {
            const total = list.cards.length;
            const done = list.cards.filter((c) => c.done).length;
            const percent = total
              ? Math.round((done / total) * 100)
              : 0;
            const status = list.status || "ongoing";
            const deadline = deadlineInfo(list.deadline);
            const open = openIds.includes(list._id);
            const panelId = `milestone-${list._id}`;
            return (
              <StyledMilestoneRow
                key={list._id}
                open={open}
                // The whole row toggles for mouse users; the title button
                // is the keyboard and screen-reader control.
                onClick={(e) => {
                  if (
                    (e.target as HTMLElement).closest(
                      "button, a, input, label"
                    )
                  )
                    return;
                  toggle(list._id);
                }}
              >
                <div className="milestone-head">
                  <h4>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggle(list._id)}
                    >
                      {list.title}
                    </button>
                  </h4>
                  <StyledRoundButton
                    size="sm"
                    aria-label={t("controlPanel.editMilestone", {
                      title: list.title,
                    })}
                    title={t("controlPanel.editDetails")}
                    onClick={(e) => {
                      // The dialog returns focus to its opener on close.
                      e.currentTarget.focus();
                      setDialog({ mode: "edit", list });
                    }}
                  >
                    <SVG name="pencil" />
                  </StyledRoundButton>
                  <StyledRoundButton
                    size="sm"
                    aria-label={t("controlPanel.openInTaskList", {
                      title: list.title,
                    })}
                    onClick={() =>
                      history.push(`/task-list?list=${list._id}`)
                    }
                  >
                    <SVG name="arrow-up-right" />
                  </StyledRoundButton>
                </div>

                <div className="milestone-meta">
                  {list.category && (
                    <StyledEntryTag>{list.category}</StyledEntryTag>
                  )}
                  <StyledStatusTag status={status}>
                    {t(`controlPanel.status_${status}`)}
                  </StyledStatusTag>
                  <p>
                    {t("controlPanel.tasksCompleted", {
                      done,
                      count: total,
                    })}
                  </p>
                </div>

                <div className="milestone-progress">
                  <StyledEntryProgress
                    percent={percent}
                    done={total > 0 && done === total}
                  />
                  <span className="percent">
                    {t("controlPanel.percent", { percent })}
                  </span>
                  {deadline && (
                    <StyledMilestoneDeadline soon={deadline.soon}>
                      {t(
                        deadline.overdue
                          ? "controlPanel.deadlinePassed"
                          : "controlPanel.deadline",
                        { date: deadline.label }
                      )}
                    </StyledMilestoneDeadline>
                  )}
                </div>

                {open && (
                  <div id={panelId} className="milestone-panel">
                    <p className="milestone-hours">
                      <SVG name="timer" />
                      {hours(loggedMs[list._id] || 0)}
                    </p>
                    {total === 0 ? (
                      <StyledCPEmpty>
                        {t("controlPanel.noSubtasks")}
                      </StyledCPEmpty>
                    ) : (
                      <StyledSubtaskList>
                        {list.cards.map((card) => {
                          const entry = entries.find(
                            (e) => e.taskCardId === card._id
                          );
                          const onBoard = boardCardFor(card._id);
                          return (
                            <StyledSubtask
                              key={card._id}
                              done={card.done}
                            >
                              <Checkbox
                                id={`subtask-${card._id}`}
                                checked={card.done}
                                label={card.text}
                                onChange={() =>
                                  setSubtaskDone(
                                    list._id,
                                    card._id,
                                    !card.done
                                  )
                                }
                              />
                              {onBoard ? (
                                <button
                                  type="button"
                                  id={`on-board-${card._id}`}
                                  className="on-board"
                                  aria-label={t(
                                    "controlPanel.onBoardLabel",
                                    { title: card.text }
                                  )}
                                  onClick={() => showOnBoard(onBoard.card.id)}
                                >
                                  <SVG name="check" />
                                  {t("controlPanel.onBoard")}
                                </button>
                              ) : (
                                <StyledCardFocus
                                  type="button"
                                  className="send"
                                  aria-label={t(
                                    "controlPanel.sendToBoardLabel",
                                    { title: card.text }
                                  )}
                                  title={t("controlPanel.sendToBoard")}
                                  onClick={() => {
                                    sendToBoard(list, card);
                                    setJustSent(card._id);
                                    setToast(
                                      t("controlPanel.addedToBoard", {
                                        title: card.text,
                                      })
                                    );
                                  }}
                                >
                                  <SVG name="add" />
                                </StyledCardFocus>
                              )}
                              <StyledCardFocus
                                type="button"
                                aria-pressed={
                                  !!entry &&
                                  entry.id === activeId &&
                                  playing
                                }
                                aria-label={t(
                                  "controlPanel.focusOnCardLabel",
                                  { title: card.text }
                                )}
                                title={t(
                                  "controlPanel.startPomodoroForCard"
                                )}
                                onClick={() =>
                                  startLinkedFocus(
                                    {
                                      taskCardId: card._id,
                                      taskListId: list._id,
                                    },
                                    {
                                      title: card.text,
                                      tag: list.title,
                                      date: todayKey,
                                      start: "",
                                      end: "",
                                    }
                                  )
                                }
                              >
                                <SVG name="play" />
                              </StyledCardFocus>
                            </StyledSubtask>
                          );
                        })}
                      </StyledSubtaskList>
                    )}
                  </div>
                )}
              </StyledMilestoneRow>
            );
          })}
        </StyledMilestones>
      )}

      <MilestoneDialog target={dialog} onClose={closeDialog} />
      <StyledToast role="status" aria-live="polite" visible={!!toast}>
        {toast}
      </StyledToast>
    </StyledCPSection>
  );
};

export default React.memo(TaskBreakdown);
