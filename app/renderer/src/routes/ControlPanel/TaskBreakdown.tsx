import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SVG } from "components";
import { useAppSelector } from "hooks/storeHooks";
import {
  StyledBreakdownRowItem,
  StyledBreakdownRows,
  StyledCPEmpty,
  StyledCPLink,
  StyledCPSection,
  StyledCPSectionHeader,
  StyledEntryProgress,
  StyledEntryTag,
  StyledRoundButton,
  StyledStatusDot,
  StyledSubtask,
  StyledSubtaskList,
  StyledTaskRow,
  StyledTaskRowMeta,
  StyledTaskRowProgress,
} from "styles";
import type { TaskList } from "store";

type Status = "notStarted" | "inProgress" | "completed";

/**
 * The task model has no subtasks, tags or due dates, so each Task List
 * list is a main task and its cards are the subtasks.
 */
const summarize = (list: TaskList) => {
  const total = list.cards.length;
  const done = list.cards.filter((card) => card.done).length;
  const status: Status =
    total > 0 && done === total
      ? "completed"
      : done > 0
      ? "inProgress"
      : "notStarted";
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    status,
  };
};

const STATUS_KEY: Record<Status, string> = {
  notStarted: "statusNotStarted",
  inProgress: "statusInProgress",
  completed: "statusCompleted",
};

const TaskBreakdown: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const lists = useAppSelector((state) => state.tasks.present);
  const [openIds, setOpenIds] = useState<string[]>([]);

  const rows = useMemo(
    () => lists.map((list) => ({ list, ...summarize(list) })),
    [lists]
  );
  const inProgress = rows.filter(
    (r) => r.status === "inProgress"
  ).length;
  const completed = rows.filter((r) => r.status === "completed").length;

  const toggle = (id: string) =>
    setOpenIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  return (
    <StyledCPSection aria-labelledby="task-breakdown-title">
      <StyledCPSectionHeader>
        <div>
          <h3 id="task-breakdown-title">
            {t("controlPanel.breakdownTitle")}
          </h3>
          <p>
            {t("controlPanel.breakdownSub", { inProgress, completed })}
          </p>
        </div>
        <StyledCPLink onClick={() => history.push("/task-list")}>
          {t("controlPanel.seeEverything")}
        </StyledCPLink>
      </StyledCPSectionHeader>

      {rows.length === 0 ? (
        <StyledCPEmpty>{t("controlPanel.noTasks")}</StyledCPEmpty>
      ) : (
        <StyledBreakdownRows>
          {rows.map(({ list, total, done, percent, status }) => {
            const open = openIds.includes(list._id);
            const subtasksId = `subtasks-${list._id}`;
            return (
              <StyledBreakdownRowItem key={list._id}>
                <StyledTaskRow>
                  <h4>{list.title}</h4>
                  <StyledRoundButton
                    aria-expanded={open}
                    aria-controls={subtasksId}
                    aria-label={t(
                      open
                        ? "controlPanel.hideSubtasks"
                        : "controlPanel.showSubtasks",
                      { task: list.title }
                    )}
                    onClick={() => toggle(list._id)}
                  >
                    <SVG name="arrow-up-right" />
                  </StyledRoundButton>

                  <StyledTaskRowMeta>
                    <StyledEntryTag>
                      {t(`controlPanel.${STATUS_KEY[status]}`)}
                    </StyledEntryTag>
                    {list.priority && (
                      <StyledEntryTag>
                        {t("controlPanel.priority")}
                      </StyledEntryTag>
                    )}
                    <p>
                      {t("controlPanel.subtasksDone", { done, total })}
                    </p>
                  </StyledTaskRowMeta>

                  <StyledTaskRowProgress>
                    <StyledEntryProgress
                      percent={percent}
                      done={status === "completed"}
                    />
                    <span>{percent}%</span>
                  </StyledTaskRowProgress>
                </StyledTaskRow>

                {open && (
                  <StyledSubtaskList id={subtasksId}>
                    {list.cards.length === 0 ? (
                      <StyledCPEmpty as="li">
                        {t("controlPanel.noSubtasks")}
                      </StyledCPEmpty>
                    ) : (
                      list.cards.map((card) => (
                        <StyledSubtask key={card._id} done={card.done}>
                          <StyledStatusDot
                            color={
                              card.done
                                ? "var(--color-status-completed)"
                                : "var(--color-status-ongoing)"
                            }
                          />
                          <span>{card.text}</span>
                        </StyledSubtask>
                      ))
                    )}
                  </StyledSubtaskList>
                )}
              </StyledBreakdownRowItem>
            );
          })}
        </StyledBreakdownRows>
      )}
    </StyledCPSection>
  );
};

export default React.memo(TaskBreakdown);
