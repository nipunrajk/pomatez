import { getDayKey } from "store/history/utils";
import { BoardCard, BoardState } from "./types";

/** Starter cards for a first run; they're ordinary cards once saved. */
export const createSampleBoard = (now = Date.now()): BoardState => {
  const inDays = (days: number) => getDayKey(now + days * 864e5);
  const card = (
    id: string,
    category: string,
    title: string,
    tags: string[],
    due: number,
    document: string,
    priority: BoardCard["priority"],
    estimate: number
  ): BoardCard => ({
    id,
    category,
    title,
    tags,
    dueDate: inDays(due),
    document,
    priority,
    estimate,
    createdAt: now,
  });

  return {
    sprint: 4,
    columns: {
      pending: [
        card(
          "sample-p1",
          "Research",
          "Lorem ipsum dolor sit amet, consectetur adipiscing",
          ["Design"],
          7,
          "Collect references and summarize the main findings.",
          "low",
          3
        ),
        card(
          "sample-p2",
          "Writing",
          "Sed do eiusmod tempor incididunt",
          ["Content"],
          9,
          "First draft, then a review pass for tone.",
          "medium",
          2
        ),
        card(
          "sample-p3",
          "Planning",
          "Ut enim ad minim veniam, quis nostrud exercitation",
          ["Sprint"],
          12,
          "Break the work into tasks and estimate each one.",
          "medium",
          4
        ),
      ],
      ongoing: [
        card(
          "sample-o1",
          "Design",
          "Duis aute irure dolor in reprehenderit",
          ["UI"],
          4,
          "Wireframes are done; visual design in progress.",
          "high",
          4
        ),
        card(
          "sample-o2",
          "Development",
          "Excepteur sint occaecat cupidatat non proident",
          ["Build"],
          5,
          "Set up the project and the first screens.",
          "high",
          6
        ),
      ],
      completed: [
        card(
          "sample-c1",
          "Review",
          "Sunt in culpa qui officia deserunt mollit",
          ["QA"],
          -1,
          "Checked against the acceptance notes.",
          "low",
          2
        ),
        card(
          "sample-c2",
          "Research",
          "Nemo enim ipsam voluptatem quia voluptas",
          ["Design"],
          -3,
          "Findings shared with the team.",
          "low",
          1
        ),
      ],
    },
  };
};
