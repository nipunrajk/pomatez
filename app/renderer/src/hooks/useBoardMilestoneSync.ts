import { useCallback } from "react";
import {
  addBoardCard,
  BOARD_COLUMNS,
  BoardCard,
  BoardColumnId,
  moveBoardCard,
  setTaskCardDone,
  setTaskCardNotDone,
  Task,
  TaskList,
} from "store";
import { useAppDispatch, useAppSelector } from "./storeHooks";

/**
 * Keeps Task Board cards and the milestone subtasks they came from in
 * step: the Completed column and a ticked subtask mean the same thing.
 */
export const useBoardMilestoneSync = () => {
  const dispatch = useAppDispatch();
  const board = useAppSelector((state) => state.board);

  const locate = useCallback(
    (predicate: (card: BoardCard) => boolean) => {
      for (const column of BOARD_COLUMNS) {
        const card = board.columns[column].find(predicate);
        if (card) return { card, column };
      }
      return null;
    },
    [board]
  );

  /** Ticks/unticks the linked subtask after a card changes column. */
  const syncSubtask = useCallback(
    (card: BoardCard, from: BoardColumnId, to: BoardColumnId) => {
      if (!card.taskCardId || !card.taskListId || from === to) return;
      const ids = { listId: card.taskListId, cardId: card.taskCardId };
      if (to === "completed") dispatch(setTaskCardDone(ids));
      else if (from === "completed") dispatch(setTaskCardNotDone(ids));
    },
    [dispatch]
  );

  /** Moves a board card (drag and drop), syncing its subtask. */
  const moveCard = useCallback(
    (id: string, toColumn: BoardColumnId, toIndex: number) => {
      const found = locate((c) => c.id === id);
      dispatch(moveBoardCard({ id, toColumn, toIndex }));
      if (found) syncSubtask(found.card, found.column, toColumn);
    },
    [dispatch, locate, syncSubtask]
  );

  /** Ticks/unticks a milestone subtask, moving its board card to match. */
  const setSubtaskDone = useCallback(
    (listId: string, cardId: string, done: boolean) => {
      dispatch((done ? setTaskCardDone : setTaskCardNotDone)({ listId, cardId }));
      const found = locate((c) => c.taskCardId === cardId);
      if (!found) return;
      if (done && found.column !== "completed") {
        dispatch(
          moveBoardCard({
            id: found.card.id,
            toColumn: "completed",
            toIndex: board.columns.completed.length,
          })
        );
      } else if (!done && found.column === "completed") {
        dispatch(
          moveBoardCard({
            id: found.card.id,
            toColumn: "pending",
            toIndex: board.columns.pending.length,
          })
        );
      }
    },
    [dispatch, locate, board]
  );

  /** The board card made from a milestone subtask, if any. */
  const boardCardFor = useCallback(
    (taskCardId: string) => locate((c) => c.taskCardId === taskCardId),
    [locate]
  );

  /** Adds a milestone subtask to the Task Board (Completed if done). */
  const sendToBoard = useCallback(
    (list: TaskList, task: Task) => {
      dispatch(
        addBoardCard(
          {
            title: task.text,
            category: list.title,
            tags: [],
            dueDate: "",
            document: task.description || "",
            taskListId: list._id,
            taskCardId: task._id,
          },
          task.done ? "completed" : "pending"
        )
      );
    },
    [dispatch]
  );

  return { moveCard, syncSubtask, setSubtaskDone, boardCardFor, sendToBoard };
};
