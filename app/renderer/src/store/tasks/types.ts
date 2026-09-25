import type { PayloadAction } from "@reduxjs/toolkit";

export type ListPayload<T extends keyof TaskList> = PayloadAction<
  TaskList[T]
>;
export type TaskPayload<T extends keyof Task> = PayloadAction<Task[T]>;

export type Task = {
  _id: string;
  text: string;
  description: string;
  done: boolean;
};

export type MilestoneStatus = "ongoing" | "review" | "paused";

export const MILESTONE_STATUSES: MilestoneStatus[] = [
  "ongoing",
  "review",
  "paused",
];

export type TaskList = {
  _id: string;
  title: string;
  cards: Task[];
  priority: boolean;
  /** Milestone details, set from the Workspace (all optional). */
  category?: string;
  /** Unset means "ongoing". */
  status?: MilestoneStatus;
  /** `YYYY-MM-DD`, or unset. */
  deadline?: string;
};

export type MilestoneDetails = Pick<
  TaskList,
  "category" | "status" | "deadline"
>;
