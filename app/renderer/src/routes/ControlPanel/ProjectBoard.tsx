import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { SVG } from "components";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useStartFocus } from "hooks/useStartFocus";
import {
  BOARD_COLUMNS,
  BoardCard,
  BoardColumnId,
  moveBoardCard,
  TimeEntry,
} from "store";
import { getDayKey } from "store/history/utils";
import {
  StyledBoard,
  StyledBoardCard,
  StyledBoardCards,
  StyledBoardColumn,
  StyledBoardColumnHeader,
  StyledBoardEyebrow,
  StyledBoardFooter,
  StyledButtonPrimary,
  StyledCardFocus,
  StyledCountPill,
  StyledCPHeaderControls,
  StyledCPSection,
  StyledCPSectionHeader,
  StyledEntryProgress,
  StyledEntryTag,
  StyledPriorityTag,
  StyledStatusDot,
  StyledTagRow,
} from "styles";
import CardDialog, { CardDialogTarget } from "./CardDialog";

const COLUMN_DOT: Record<BoardColumnId, string> = {
  pending: "var(--color-status-pending)",
  ongoing: "var(--color-status-ongoing)",
  completed: "var(--color-status-completed)",
};

const CATEGORY_COLORS = [
  "var(--color-brand-primary)",
  "var(--color-status-completed)",
  "var(--color-status-planning)",
  "var(--color-status-ongoing)",
];

/** A stable color per category name. */
const categoryColor = (name: string) => {
  const key = name.toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

type CardProps = {
  card: BoardCard;
  lifted: boolean;
  /** In the Completed column: no due-date warning. */
  completed: boolean;
  /** Finished focus sessions credited to this card. */
  pomodoros: number;
  focusing: boolean;
  onFocus: () => void;
};

const CardBody: React.FC<CardProps> = ({
  card,
  lifted,
  completed,
  pomodoros,
  focusing,
  onFocus,
}) => {
  const { t, i18n } = useTranslation();
  const [y, m, d] = card.dueDate.split("-").map(Number);
  const due = card.dueDate ? new Date(y, m - 1, d) : null;
  const todayKey = getDayKey(Date.now());
  const dueState =
    !due || completed
      ? null
      : card.dueDate < todayKey
      ? "overdue"
      : card.dueDate === todayKey
      ? "today"
      : null;
  const showPomodoros = !!card.estimate || pomodoros > 0;

  return (
    <>
      {card.category && (
        <StyledBoardEyebrow lifted={lifted}>
          <StyledStatusDot
            color={
              lifted
                ? "var(--component-card-highlighted-text)"
                : categoryColor(card.category)
            }
          />
          {card.category}
        </StyledBoardEyebrow>
      )}
      <h5>{card.title}</h5>
      {card.document && <p>{card.document}</p>}
      {(card.priority || card.tags.length > 0) && (
        <StyledTagRow lifted={lifted}>
          {card.priority && (
            <StyledPriorityTag level={card.priority}>
              {t(`controlPanel.priority_${card.priority}`)}
            </StyledPriorityTag>
          )}
          {card.tags.map((tag) => (
            <StyledEntryTag key={tag}>{tag}</StyledEntryTag>
          ))}
        </StyledTagRow>
      )}
      <StyledBoardFooter lifted={lifted} warn={!!dueState}>
        {due && (
          <span
            className="due"
            title={
              dueState ? t(`controlPanel.due_${dueState}`) : undefined
            }
          >
            <SVG name={dueState ? "alert" : "calendar"} />
            {due.toLocaleDateString(i18n.language, {
              month: "short",
              day: "numeric",
            })}
            {dueState && (
              <span className="visually-hidden">
                {" "}
                ({t(`controlPanel.due_${dueState}`)})
              </span>
            )}
          </span>
        )}
        {showPomodoros && (
          <span
            className="pomodoros"
            aria-label={t(
              card.estimate
                ? "controlPanel.pomodorosOfEstimate"
                : "controlPanel.pomodorosDone",
              { count: pomodoros, estimate: card.estimate }
            )}
          >
            <SVG name="timer" />
            {card.estimate
              ? `${pomodoros}/${card.estimate}`
              : pomodoros}
          </span>
        )}
        <StyledCardFocus
          type="button"
          aria-pressed={focusing}
          aria-label={t("controlPanel.focusOnCardLabel", {
            title: card.title,
          })}
          title={t("controlPanel.focusOnCard")}
          onClick={(e) => {
            e.stopPropagation();
            onFocus();
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <SVG name="play" />
        </StyledCardFocus>
      </StyledBoardFooter>
    </>
  );
};

const ProjectBoard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const board = useAppSelector((state) => state.board);
  const entries = useAppSelector((state) => state.entries.items);
  const activeId = useAppSelector((state) => state.entries.activeId);
  const playing = useAppSelector((state) => state.timer.playing);
  const startLinkedFocus = useStartFocus();
  const linked = useMemo(() => {
    const map: Record<string, TimeEntry> = {};
    entries.forEach((e) => {
      if (e.boardCardId) map[e.boardCardId] = e;
    });
    return map;
  }, [entries]);
  const [dialog, setDialog] = useState<CardDialogTarget | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);

  const total = BOARD_COLUMNS.reduce(
    (sum, id) => sum + board.columns[id].length,
    0
  );
  const done = board.columns.completed.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const onDragEnd = ({
    destination,
    source,
    draggableId,
  }: DropResult) => {
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }
    dispatch(
      moveBoardCard({
        id: draggableId,
        toColumn: destination.droppableId as BoardColumnId,
        toIndex: destination.index,
      })
    );
  };

  return (
    <StyledCPSection aria-labelledby="project-board-title">
      <StyledCPSectionHeader>
        <div>
          <h3 id="project-board-title">
            {t("controlPanel.boardTitle")}
          </h3>
          <p>
            {t("controlPanel.boardProgress", {
              done,
              total,
              sprint: board.sprint,
            })}
          </p>
        </div>
        <StyledCPHeaderControls>
          <StyledEntryProgress
            percent={percent}
            done={percent === 100}
          />
          <span>{percent}%</span>
          <StyledButtonPrimary
            onClick={() =>
              setDialog({ mode: "create", column: "pending" })
            }
          >
            <SVG name="add" />
            {t("controlPanel.createCard")}
          </StyledButtonPrimary>
        </StyledCPHeaderControls>
      </StyledCPSectionHeader>

      <DragDropContext
        onDragEnd={onDragEnd}
        dragHandleUsageInstructions={t("controlPanel.dragInstructions")}
      >
        <StyledBoard>
          {BOARD_COLUMNS.map((id) => {
            const label = t(`controlPanel.${id}`);
            const cards = board.columns[id];
            return (
              <StyledBoardColumn key={id}>
                <StyledBoardColumnHeader>
                  <StyledStatusDot color={COLUMN_DOT[id]} />
                  <h4 id={`board-column-${id}`}>{label}</h4>
                  <StyledCountPill>{cards.length}</StyledCountPill>
                </StyledBoardColumnHeader>

                <Droppable droppableId={id}>
                  {(drop, dropState) => (
                    <StyledBoardCards
                      ref={drop.innerRef}
                      {...drop.droppableProps}
                      aria-labelledby={`board-column-${id}`}
                      isOver={dropState.isDraggingOver}
                    >
                      {cards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(drag, dragState) => (
                            <StyledBoardCard
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              lifted={dragState.isDragging}
                              onClick={() =>
                                setDialog({
                                  mode: "edit",
                                  column: id,
                                  card,
                                })
                              }
                              onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  setDialog({
                                    mode: "edit",
                                    column: id,
                                    card,
                                  });
                                }
                              }}
                            >
                              <CardBody
                                card={card}
                                lifted={dragState.isDragging}
                                completed={id === "completed"}
                                pomodoros={
                                  linked[card.id]?.focusSessions || 0
                                }
                                focusing={
                                  !!linked[card.id] &&
                                  linked[card.id].id === activeId &&
                                  playing
                                }
                                onFocus={() =>
                                  startLinkedFocus(
                                    { boardCardId: card.id },
                                    {
                                      title: card.title,
                                      tag: card.category,
                                      date: getDayKey(Date.now()),
                                      start: "",
                                      end: "",
                                    }
                                  )
                                }
                              />
                            </StyledBoardCard>
                          )}
                        </Draggable>
                      ))}
                      {drop.placeholder}
                    </StyledBoardCards>
                  )}
                </Droppable>
              </StyledBoardColumn>
            );
          })}
        </StyledBoard>
      </DragDropContext>

      <CardDialog target={dialog} onClose={closeDialog} />
    </StyledCPSection>
  );
};

export default React.memo(ProjectBoard);
