import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFromStorage } from "utils";
import { createSampleBoard } from "./sample";
import {
  BOARD_COLUMNS,
  BoardCard,
  BoardCardDraft,
  BoardColumnId,
  BoardState,
} from "./types";

export * from "./types";

const loadInitialState = (): BoardState => {
  const persisted = getFromStorage("state")?.board as
    | BoardState
    | undefined;
  if (
    !persisted ||
    !persisted.columns ||
    !BOARD_COLUMNS.every((id) => Array.isArray(persisted.columns[id]))
  ) {
    return createSampleBoard();
  }
  return persisted;
};

const findCard = (state: BoardState, id: string) => {
  for (const column of BOARD_COLUMNS) {
    const index = state.columns[column].findIndex(
      (card) => card.id === id
    );
    if (index !== -1) return { column, index };
  }
  return null;
};

const boardSlice = createSlice({
  name: "board",
  initialState: loadInitialState(),
  reducers: {
    addBoardCard: {
      reducer(
        state,
        action: PayloadAction<{
          card: BoardCard;
          column: BoardColumnId;
        }>
      ) {
        state.columns[action.payload.column].push(action.payload.card);
      },
      prepare(draft: BoardCardDraft, column: BoardColumnId) {
        const now = Date.now();
        return {
          payload: {
            column,
            card: {
              ...draft,
              id: `${now.toString(36)}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              createdAt: now,
            },
          },
        };
      },
    },

    /** Edits a card; a new `column` moves it to the end of that column. */
    updateBoardCard(
      state,
      action: PayloadAction<{
        id: string;
        changes: BoardCardDraft;
        column: BoardColumnId;
      }>
    ) {
      const { id, changes, column } = action.payload;
      const found = findCard(state, id);
      if (!found) return;
      const card = state.columns[found.column][found.index];
      Object.assign(card, changes);
      if (found.column !== column) {
        state.columns[found.column].splice(found.index, 1);
        state.columns[column].push(card);
      }
    },

    removeBoardCard(state, action: PayloadAction<string>) {
      const found = findCard(state, action.payload);
      if (found) state.columns[found.column].splice(found.index, 1);
    },

    moveBoardCard(
      state,
      action: PayloadAction<{
        id: string;
        toColumn: BoardColumnId;
        toIndex: number;
      }>
    ) {
      const { id, toColumn, toIndex } = action.payload;
      const found = findCard(state, id);
      if (!found) return;
      const [card] = state.columns[found.column].splice(found.index, 1);
      state.columns[toColumn].splice(toIndex, 0, card);
    },
  },
});

export const {
  addBoardCard,
  updateBoardCard,
  removeBoardCard,
  moveBoardCard,
} = boardSlice.actions;

export default boardSlice.reducer;
