import fs from "fs";
import path from "path";

/**
 * Writes Pomatez notes into an Obsidian vault (one way). Only touches the
 * export folder inside the vault, only writes `.md` files there, and only
 * removes notes that a previous export wrote (listed in its manifest).
 * Plain Node, so it can be tested outside Electron.
 */

export const MANIFEST = ".pomatez-export.json";
const MAX_FILES = 5000;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

export type NoteFile = { path: string; content: string };

export type ExportError =
  | "noVault"
  | "vaultMissing"
  | "badFolder"
  | "badFile"
  | "writeFailed";

export type ExportResult =
  | { ok: true; written: number; removed: number }
  | { ok: false; error: ExportError };

const BAD_CHARS = /[\\:*?"<>|\u0000-\u001f]/;

/** A relative path of plain segments: no `..`, no hidden or empty parts. */
const safeSegments = (rel: string, maxDepth: number) => {
  if (typeof rel !== "string" || !rel || rel.length > 400) return null;
  const parts = rel.split("/");
  if (parts.length > maxDepth) return null;
  for (const part of parts) {
    if (
      !part ||
      part.trim() !== part ||
      part.startsWith(".") ||
      BAD_CHARS.test(part)
    ) {
      return null;
    }
  }
  return parts;
};

const inside = (base: string, target: string) =>
  target.startsWith(base + path.sep);

export const isObsidianVault = (dir: string) => {
  try {
    return fs.statSync(path.join(dir, ".obsidian")).isDirectory();
  } catch {
    return false;
  }
};

const readManifest = (base: string): string[] => {
  try {
    const parsed = JSON.parse(
      fs.readFileSync(path.join(base, MANIFEST), "utf8")
    );
    return Array.isArray(parsed?.files)
      ? parsed.files.filter((f: unknown) => typeof f === "string")
      : [];
  } catch {
    return [];
  }
};

export const writeNotes = (
  vaultPath: string | undefined,
  folder: unknown,
  files: unknown
): ExportResult => {
  if (!vaultPath) return { ok: false, error: "noVault" };
  let vault: string;
  try {
    if (!fs.statSync(vaultPath).isDirectory()) throw new Error();
    vault = fs.realpathSync(vaultPath);
  } catch {
    return { ok: false, error: "vaultMissing" };
  }

  const folderParts =
    typeof folder === "string" ? safeSegments(folder.trim(), 3) : null;
  if (!folderParts) return { ok: false, error: "badFolder" };
  const base = path.resolve(vault, ...folderParts);
  if (!inside(vault, base)) return { ok: false, error: "badFolder" };

  if (!Array.isArray(files) || files.length > MAX_FILES) {
    return { ok: false, error: "badFile" };
  }
  const notes: { rel: string; abs: string; content: string }[] = [];
  const seen = new Set<string>();
  for (const file of files as NoteFile[]) {
    const parts = safeSegments(file?.path, 4);
    if (
      !parts ||
      !file.path.endsWith(".md") ||
      typeof file.content !== "string" ||
      Buffer.byteLength(file.content) > MAX_FILE_BYTES ||
      seen.has(file.path.toLowerCase())
    ) {
      return { ok: false, error: "badFile" };
    }
    seen.add(file.path.toLowerCase());
    const abs = path.resolve(base, ...parts);
    if (!inside(base, abs)) return { ok: false, error: "badFile" };
    notes.push({ rel: file.path, abs, content: file.content });
  }

  // The folder (or a parent) must not be a link out of the vault. Checked
  // on the deepest part that exists, before creating anything.
  let existing = base;
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  try {
    const real = fs.realpathSync(existing);
    if (real !== vault && !inside(vault, real)) {
      return { ok: false, error: "badFolder" };
    }
  } catch {
    return { ok: false, error: "badFolder" };
  }

  try {
    fs.mkdirSync(base, { recursive: true });

    for (const note of notes) {
      fs.mkdirSync(path.dirname(note.abs), { recursive: true });
      fs.writeFileSync(note.abs, note.content, "utf8");
    }

    // Notes from the last export that this one no longer has (a renamed
    // or deleted milestone). Only paths Pomatez wrote, never user notes.
    const current = new Set(notes.map((n) => n.rel));
    let removed = 0;
    for (const rel of readManifest(base)) {
      if (current.has(rel)) continue;
      const parts = safeSegments(rel, 4);
      if (!parts || !rel.endsWith(".md")) continue;
      const abs = path.resolve(base, ...parts);
      if (!inside(base, abs)) continue;
      try {
        fs.unlinkSync(abs);
        removed++;
      } catch {
        // Already gone.
      }
    }

    fs.writeFileSync(
      path.join(base, MANIFEST),
      JSON.stringify(
        {
          note: "Written by Pomatez. Notes listed here are replaced on every export.",
          exportedAt: new Date().toISOString(),
          files: notes.map((n) => n.rel),
        },
        null,
        2
      )
    );
    return { ok: true, written: notes.length, removed };
  } catch (error) {
    console.error("[Obsidian] Export failed", error);
    return { ok: false, error: "writeFailed" };
  }
};
