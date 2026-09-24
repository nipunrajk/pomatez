export type BoardColumnId = "pending" | "ongoing" | "completed";

export const BOARD_COLUMNS: BoardColumnId[] = [
  "pending",
  "ongoing",
  "completed",
];

export type BoardCard = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  /** `YYYY-MM-DD`, or "" when there's no due date. */
  dueDate: string;
  /** Free-form notes for the card. */
  document: string;
  createdAt: number;
};

export type BoardCardDraft = Omit<BoardCard, "id" | "createdAt">;

export type BoardState = {
  sprint: number;
  columns: Record<BoardColumnId, BoardCard[]>;
};
