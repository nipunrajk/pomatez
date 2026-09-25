import React, { useCallback, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Checkbox, SVG } from "components";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useNow } from "hooks/useNow";
import { useStartFocus } from "hooks/useStartFocus";
import {
  MilestoneStatus,
  setTaskCardDone,
  setTaskCardNotDone,
  TaskList,
} from "store";
import { getDayKey } from "store/history/utils";
import {
  StyledCardFocus,
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
} from "styles";
import MilestoneDialog from "./MilestoneDialog";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Each Task List list is a milestone: its cards are the tasks, and it has
 * optional category, status and deadline set from here.
 */
const TaskBreakdown: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const lists = useAppSelector((state) => state.tasks.present);
  const entries = useAppSelector((state) => state.entries.items);
  const activeId = useAppSelector((state) => state.entries.activeId);
  const playing = useAppSelector((state) => state.timer.playing);
  const startLinkedFocus = useStartFocus();
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [editing, setEditing] = useState<TaskList | null>(null);
  const closeDialog = useCallback(() => setEditing(null), []);

  const linkedRunning = entries.some(
    (e) => e.taskListId && e.runningSince !== null
  );
  const now = useNow(linkedRunning);

  const loggedMs = useMemo(() => {
    const byList: Record<string, number> = {};
    entries.forEach((e) => {
      if (!e.taskListId) return;
      const running =
        e.runningSince !== null ? now - e.runningSince : 0;
      byList[e.taskListId] =
        (byList[e.taskListId] || 0) +
        e.trackedMs +
        Math.max(0, running);
    });
    return byList;
  }, [entries, now]);

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
    <StyledCPSection aria-labelledby="task-breakdown-title">
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
        <StyledCPLink onClick={() => history.push("/task-list")}>
          {t("controlPanel.seeEverything")}
          <SVG name="arrow-up-right" />
        </StyledCPLink>
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
                      setEditing(list);
                    }}
                  >
                    <SVG name="pencil" />
                  </StyledRoundButton>
                  <StyledRoundButton
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
                                  dispatch(
                                    (card.done
                                      ? setTaskCardNotDone
                                      : setTaskCardDone)({
                                      listId: list._id,
                                      cardId: card._id,
                                    })
                                  )
                                }
                              />
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

      <MilestoneDialog list={editing} onClose={closeDialog} />
    </StyledCPSection>
  );
};

export default React.memo(TaskBreakdown);
