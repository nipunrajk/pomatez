import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { SVG } from "components";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  BOARD_COLUMNS,
  BoardCard,
  BoardColumnId,
  moveBoardCard,
} from "store";
import {
  StyledBoard,
  StyledBoardCard,
  StyledBoardCards,
  StyledBoardColumn,
  StyledBoardColumnHeader,
  StyledBoardEyebrow,
  StyledBoardFooter,
  StyledButtonSecondary,
  StyledCountPill,
  StyledCPLink,
  StyledCPProgressRow,
  StyledCPSection,
  StyledCPSectionHeader,
  StyledEntryProgress,
  StyledEntryTag,
  StyledRoundButton,
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
  locale: string;
};

const CardBody: React.FC<CardProps> = ({ card, lifted, locale }) => {
  const [y, m, d] = card.dueDate.split("-").map(Number);
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
      {card.tags.length > 0 && (
        <StyledTagRow lifted={lifted}>
          {card.tags.map((tag) => (
            <StyledEntryTag key={tag}>{tag}</StyledEntryTag>
          ))}
        </StyledTagRow>
      )}
      {card.dueDate && (
        <StyledBoardFooter lifted={lifted}>
          <SVG name="calendar" />
          {new Date(y, m - 1, d).toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
          })}
        </StyledBoardFooter>
      )}
    </>
  );
};

const ProjectBoard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const board = useAppSelector((state) => state.board);
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
        <StyledCPLink onClick={() => history.push("/task-list")}>
          {t("controlPanel.seeAll")}
        </StyledCPLink>
        <StyledCPProgressRow>
          <StyledEntryProgress
            percent={percent}
            done={percent === 100}
          />
          <span>{percent}%</span>
          <StyledButtonSecondary
            onClick={() =>
              setDialog({ mode: "create", column: "pending" })
            }
          >
            <SVG name="add" />
            {t("controlPanel.createCard")}
          </StyledButtonSecondary>
        </StyledCPProgressRow>
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
                  <StyledRoundButton
                    size="sm"
                    aria-label={t("controlPanel.addCard", {
                      column: label,
                    })}
                    onClick={() =>
                      setDialog({ mode: "create", column: id })
                    }
                  >
                    <SVG name="add" />
                  </StyledRoundButton>
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
                                locale={i18n.language}
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
