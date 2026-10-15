import type { BoardState } from "store/board/types";
import type { TimeEntry } from "store/entries/types";
import type { TaskList } from "store/tasks/types";
import { renderTemplate, TemplateView } from "utils/noteTemplate";

/**
 * Pomatez → Obsidian (one way). Builds Markdown notes from the app state
 * and the user's templates; Electron main writes them into the vault.
 */

export type NoteKind = "milestone" | "day";

export type NoteFile = { path: string; content: string };

export const DEFAULT_TEMPLATES: Record<NoteKind, string> = {
  milestone: `---
type: milestone
status: {{status}}
category: {{category|yaml}}
deadline: {{deadline}}
progress: {{percent}}
source: pomatez
---
# {{title}}

{{done}} of {{total}} tasks done ({{percent}}%) · {{logged}} logged
{{#deadline}}
Deadline: {{deadline}}
{{/deadline}}

## Tasks
{{#tasks}}
- [{{check}}] {{text}}
{{/tasks}}
{{^tasks}}
_No tasks yet._
{{/tasks}}
`,
  day: `---
type: pomatez-day
date: {{date}}
tracked: {{tracked}}
source: pomatez
---
# {{dateLabel}}

Tracked: **{{tracked}}** · Entries: {{count}}

## Entries
{{#entries}}
- {{time}} **{{title}}** · {{tracked}}{{#milestone}} · [[{{milestone}}]]{{/milestone}}{{#tag}} #{{tag}}{{/tag}}
{{/entries}}
`,
};

/** Placeholders each template can use, for the help text in Settings. */
export const TEMPLATE_FIELDS: Record<NoteKind, string[]> = {
  milestone: [
    "title",
    "status",
    "category",
    "deadline",
    "done",
    "total",
    "percent",
    "logged",
    "exportedAt",
    "#tasks: text, check, done, description",
  ],
  day: [
    "date",
    "dateLabel",
    "weekday",
    "tracked",
    "count",
    "exportedAt",
    "#entries: title, time, start, end, tracked, mode, tag, milestone, sessions",
  ],
};

export const MILESTONES_DIR = "Milestones";
export const DAYS_DIR = "Days";

/** A file name Obsidian (and every OS) accepts, and a link can match. */
export const safeFileName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|#^[\]]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[.\s-]+|[.\s]+$/g, "")
    .slice(0, 120) || "Untitled";

const formatDuration = (ms: number) => {
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const entryMs = (entry: TimeEntry, now: number) =>
  entry.trackedMs +
  (entry.runningSince !== null ? Math.max(0, now - entry.runningSince) : 0);

export type ExportInput = {
  lists: TaskList[];
  entries: TimeEntry[];
  board: BoardState;
  language: string;
  now?: number;
};

const build = ({
  lists,
  entries,
  board,
  language,
  now = Date.now(),
}: ExportInput) => {
  const exportedAt = new Date(now).toISOString();

  // Unique note names per milestone ("Launch", "Launch (2)").
  const names: Record<string, string> = {};
  const used = new Set<string>();
  lists.forEach((list) => {
    const base = safeFileName(list.title);
    let name = base;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base} (${n})`;
    used.add(name.toLowerCase());
    names[list._id] = name;
  });

  // Entries count toward a milestone when started from one of its
  // subtasks or from a board card linked to it (as on the Workspace).
  const cardList: Record<string, string> = {};
  Object.values(board.columns).forEach((cards) =>
    cards.forEach((card) => {
      if (card.taskListId) cardList[card.id] = card.taskListId;
    })
  );
  const listOf = (e: TimeEntry) =>
    e.taskListId || (e.boardCardId && cardList[e.boardCardId]) || "";

  const loggedMs: Record<string, number> = {};
  entries.forEach((e) => {
    const id = listOf(e);
    if (id) loggedMs[id] = (loggedMs[id] || 0) + entryMs(e, now);
  });

  const milestones = lists.map((list) => {
    const total = list.cards.length;
    const done = list.cards.filter((c) => c.done).length;
    const view: TemplateView = {
      title: list.title,
      status: list.status || "ongoing",
      category: list.category || "",
      deadline: list.deadline || "",
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
      logged: formatDuration(loggedMs[list._id] || 0),
      exportedAt,
      tasks: list.cards.map((c) => ({
        text: c.text.replace(/\s*\n\s*/g, " "),
        check: c.done ? "x" : " ",
        done: c.done,
        description: c.description || "",
      })),
    };
    return { list, view };
  });

  const byDate: Record<string, TimeEntry[]> = {};
  entries.forEach((e) => {
    (byDate[e.date] = byDate[e.date] || []).push(e);
  });
  const days = Object.keys(byDate)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort()
    .map((date) => {
      const [y, m, d] = date.split("-").map(Number);
      const day = new Date(y, m - 1, d);
      const items = [...byDate[date]].sort(
        (a, b) =>
          (a.start || "99").localeCompare(b.start || "99") ||
          a.createdAt - b.createdAt
      );
      const total = items.reduce((sum, e) => sum + entryMs(e, now), 0);
      const view: TemplateView = {
        date,
        dateLabel: day.toLocaleDateString(language, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        weekday: day.toLocaleDateString(language, { weekday: "long" }),
        tracked: formatDuration(total),
        count: items.length,
        exportedAt,
        entries: items.map((e) => {
          const id = listOf(e);
          return {
            title: e.title.replace(/\s*\n\s*/g, " ") || "Untitled",
            start: e.start,
            end: e.end,
            time: e.start ? (e.end ? `${e.start}–${e.end}` : e.start) : "Unplanned",
            tracked: formatDuration(entryMs(e, now)),
            mode: e.mode,
            // Obsidian tags can't hold spaces.
            tag: e.tag.trim().replace(/\s+/g, "-"),
            milestone: id && names[id] ? names[id] : "",
            sessions: e.focusSessions || 0,
          };
        }),
      };
      return { date, view };
    });

  return { milestones, days, names };
};

/** Every note an export writes, relative to the export folder. */
export const buildObsidianNotes = (
  input: ExportInput,
  templates: Record<NoteKind, string>
): NoteFile[] => {
  const { milestones, days, names } = build(input);
  return [
    ...milestones.map(({ list, view }) => ({
      path: `${MILESTONES_DIR}/${names[list._id]}.md`,
      content: renderTemplate(templates.milestone, view),
    })),
    ...days.map(({ date, view }) => ({
      path: `${DAYS_DIR}/${date}.md`,
      content: renderTemplate(templates.day, view),
    })),
  ];
};

/** The first note of a kind, rendered, for the template preview. */
export const previewNote = (
  input: ExportInput,
  kind: NoteKind,
  template: string
): { name: string; content: string } | null => {
  const { milestones, days, names } = build(input);
  if (kind === "milestone") {
    const first = milestones[0];
    return first
      ? {
          name: `${MILESTONES_DIR}/${names[first.list._id]}.md`,
          content: renderTemplate(template, first.view),
        }
      : null;
  }
  const latest = days[days.length - 1];
  return latest
    ? {
        name: `${DAYS_DIR}/${latest.date}.md`,
        content: renderTemplate(template, latest.view),
      }
    : null;
};
