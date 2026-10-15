export type BoardColumnId = "pending" | "ongoing" | "completed";

export const BOARD_COLUMNS: BoardColumnId[] = [
  "pending",
  "ongoing",
  "completed",
];

export type BoardPriority = "low" | "medium" | "high";

export const BOARD_PRIORITIES: BoardPriority[] = [
  "low",
  "medium",
  "high",
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
  priority?: BoardPriority;
  /** Estimated Pomodoros. */
  estimate?: number;
  /** Project Milestone (Task List list) this card belongs to. */
  taskListId?: string;
  /** The milestone subtask (Task List card) it was sent from, if any. */
  taskCardId?: string;
  createdAt: number;
};

export type BoardCardDraft = Omit<BoardCard, "id" | "createdAt">;

export type BoardState = {
  sprint: number;
  columns: Record<BoardColumnId, BoardCard[]>;
};
