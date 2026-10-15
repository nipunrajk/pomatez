import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getFromStorage } from "utils";
import type { NoteKind } from "integrations/obsidian";

export type ObsidianSettings = {
  /** Folder inside the vault that Pomatez owns. */
  folder: string;
  /** Custom templates; a missing kind uses the built-in default. */
  templates: Partial<Record<NoteKind, string>>;
};

/** From Electron main; not persisted. */
export type ObsidianStatus = {
  available: boolean;
  vaultPath: string | null;
  /** The chosen folder has a `.obsidian` folder. */
  isVault: boolean;
  exporting: boolean;
  result:
    | { ok: true; written: number; removed: number; at: number }
    | { ok: false; error: string; at: number }
    | null;
};

export type IntegrationsState = {
  obsidian: ObsidianSettings;
  obsidianStatus: ObsidianStatus;
};

export const DEFAULT_OBSIDIAN_FOLDER = "Pomatez";

const persisted = getFromStorage("state")?.integrations?.obsidian as
  | Partial<ObsidianSettings>
  | undefined;

const initialState: IntegrationsState = {
  obsidian: {
    folder:
      typeof persisted?.folder === "string" && persisted.folder.trim()
        ? persisted.folder
        : DEFAULT_OBSIDIAN_FOLDER,
    templates:
      persisted?.templates && typeof persisted.templates === "object"
        ? persisted.templates
        : {},
  },
  obsidianStatus: {
    available: false,
    vaultPath: null,
    isVault: false,
    exporting: false,
    result: null,
  },
};

const integrationsSlice = createSlice({
  name: "integrations",
  initialState,
  reducers: {
    setObsidianFolder(state, action: PayloadAction<string>) {
      state.obsidian.folder = action.payload;
    },

    setObsidianTemplate(
      state,
      action: PayloadAction<{ kind: NoteKind; template: string }>
    ) {
      state.obsidian.templates[action.payload.kind] =
        action.payload.template;
    },

    resetObsidianTemplate(state, action: PayloadAction<NoteKind>) {
      delete state.obsidian.templates[action.payload];
    },

    setObsidianVault(
      state,
      action: PayloadAction<{ vaultPath: string | null; isVault: boolean }>
    ) {
      state.obsidianStatus.available = true;
      state.obsidianStatus.vaultPath = action.payload.vaultPath;
      state.obsidianStatus.isVault = action.payload.isVault;
    },

    setObsidianExporting(state) {
      state.obsidianStatus.exporting = true;
      state.obsidianStatus.result = null;
    },

    setObsidianExportResult(
      state,
      action: PayloadAction<ObsidianStatus["result"]>
    ) {
      state.obsidianStatus.exporting = false;
      state.obsidianStatus.result = action.payload;
    },
  },
});

export const {
  setObsidianFolder,
  setObsidianTemplate,
  resetObsidianTemplate,
  setObsidianVault,
  setObsidianExporting,
  setObsidianExportResult,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;
