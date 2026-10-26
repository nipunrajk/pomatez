import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  OBSIDIAN_EXPORT,
  OBSIDIAN_FORGET_VAULT,
  OBSIDIAN_PICK_VAULT,
} from "@pomatez/shareables";
import { getInvokeConnector } from "contexts";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  buildObsidianNotes,
  DAYS_DIR,
  DEFAULT_TEMPLATES,
  MILESTONES_DIR,
  NoteKind,
  previewNote,
  TEMPLATE_FIELDS,
} from "integrations/obsidian";
import {
  DEFAULT_OBSIDIAN_FOLDER,
  resetObsidianTemplate,
  setObsidianExporting,
  setObsidianFolder,
  setObsidianTemplate,
} from "store";
import {
  StyledButton,
  StyledButtonNormal,
  StyledButtonPrimary,
  StyledInput,
  StyledObsidianSection,
  StyledSettingsSubsection,
  StyledTextArea,
} from "styles";

const KINDS: NoteKind[] = ["milestone", "day"];

/** Same rules Electron main enforces: up to 3 plain folder names. */
const validFolder = (folder: string) => {
  const parts = folder.trim().split("/");
  return (
    parts.length <= 3 &&
    parts.every(
      (p) =>
        p &&
        p.trim() === p &&
        !p.startsWith(".") &&
        !/[\\:*?"<>|]/.test(p)
    )
  );
};

/** "#tasks: text, check" → "{{#tasks}}…{{/tasks}} ({{text}} {{check}})". */
const formatField = (field: string) => {
  if (!field.startsWith("#")) return `{{${field}}}`;
  const [name, inner = ""] = field.slice(1).split(": ");
  const vars = inner
    .split(", ")
    .filter(Boolean)
    .map((v) => `{{${v}}}`)
    .join(" ");
  return `{{#${name}}}…{{/${name}}} (${vars})`;
};

/** Settings → Obsidian: export milestones and days as Markdown notes. */
const ObsidianSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { obsidian, obsidianStatus: status } = useAppSelector(
    (state) => state.integrations
  );
  const lists = useAppSelector((state) => state.tasks.present);
  const entries = useAppSelector((state) => state.entries.items);
  const board = useAppSelector((state) => state.board);
  const [kind, setKind] = useState<NoteKind>("milestone");
  const [folder, setFolder] = useState(obsidian.folder);

  const templates = {
    milestone: obsidian.templates.milestone ?? DEFAULT_TEMPLATES.milestone,
    day: obsidian.templates.day ?? DEFAULT_TEMPLATES.day,
  };
  const template = templates[kind];
  const isDefault = obsidian.templates[kind] === undefined;

  const input = useMemo(
    () => ({ lists, entries, board, language: i18n.language }),
    [lists, entries, board, i18n.language]
  );
  const preview = useMemo(
    () => previewNote(input, kind, template),
    [input, kind, template]
  );

  if (!status.available) return null;

  const folderOk = validFolder(folder);
  const send = (channel: string, payload?: unknown) =>
    getInvokeConnector()?.send(channel, payload);

  const onTemplate = (text: string) => {
    // Matching the default again means "use the default" (and its updates).
    if (text === DEFAULT_TEMPLATES[kind]) {
      dispatch(resetObsidianTemplate(kind));
    } else {
      dispatch(setObsidianTemplate({ kind, template: text }));
    }
  };

  const onExport = () => {
    if (!status.vaultPath || !folderOk) return;
    const files = buildObsidianNotes(input, templates);
    dispatch(setObsidianExporting());
    send(OBSIDIAN_EXPORT, { folder: folder.trim(), files });
  };

  const result = status.result;

  return (
    <StyledSettingsSubsection>
      <h5>{t("obsidian.heading")}</h5>
      <StyledObsidianSection>
        <p>{t("obsidian.description")}</p>

        <div className="field">
          <span>{t("obsidian.vault")}</span>
          <div className="vault">
            <code>
              {status.vaultPath || t("obsidian.noVault")}
            </code>
            <StyledButtonNormal
              type="button"
              onClick={() => send(OBSIDIAN_PICK_VAULT)}
            >
              {t(
                status.vaultPath
                  ? "obsidian.changeVault"
                  : "obsidian.chooseVault"
              )}
            </StyledButtonNormal>
            {status.vaultPath && (
              <StyledButton
                type="button"
                onClick={() => send(OBSIDIAN_FORGET_VAULT)}
              >
                {t("obsidian.forgetVault")}
              </StyledButton>
            )}
          </div>
          {status.vaultPath && !status.isVault && (
            <p className="warn">{t("obsidian.notAVault")}</p>
          )}
        </div>

        <label className="field">
          <span>{t("obsidian.folder")}</span>
          <StyledInput
            value={folder}
            spellCheck={false}
            aria-invalid={!folderOk}
            aria-describedby="obsidian-folder-hint"
            onChange={(e) => {
              setFolder(e.target.value);
              if (validFolder(e.target.value)) {
                dispatch(setObsidianFolder(e.target.value.trim()));
              }
            }}
            onBlur={() => {
              if (folder.trim()) return;
              setFolder(DEFAULT_OBSIDIAN_FOLDER);
              dispatch(setObsidianFolder(DEFAULT_OBSIDIAN_FOLDER));
            }}
          />
          <span
            id="obsidian-folder-hint"
            className={folderOk ? "hint" : "warn"}
          >
            {folderOk
              ? t("obsidian.folderHint", {
                  milestones: `${folder.trim()}/${MILESTONES_DIR}`,
                  days: `${folder.trim()}/${DAYS_DIR}`,
                })
              : t("obsidian.folderInvalid")}
          </span>
        </label>

        <fieldset className="field">
          <legend>{t("obsidian.templates")}</legend>
          <div className="template-kinds">
            {KINDS.map((k) => (
              <StyledButtonNormal
                key={k}
                type="button"
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
              >
                {t(`obsidian.kind_${k}`)}
              </StyledButtonNormal>
            ))}
          </div>

          <div className="template-grid">
            <div className="field">
              <div className="template-caption">
                <label htmlFor="obsidian-template">
                  {t("obsidian.templateLabel", {
                    kind: t(`obsidian.kind_${kind}`),
                  })}
                </label>
                <StyledButton
                  type="button"
                  disabled={isDefault}
                  onClick={() => dispatch(resetObsidianTemplate(kind))}
                >
                  {t("obsidian.resetTemplate")}
                </StyledButton>
              </div>
              <StyledTextArea
                id="obsidian-template"
                value={template}
                spellCheck={false}
                aria-describedby="obsidian-fields"
                onChange={(e) => onTemplate(e.target.value)}
              />
            </div>
            <div className="field">
              <div className="template-caption">
                <span id="obsidian-preview-label">
                  {t("obsidian.preview")}
                </span>
                {preview && <code>{preview.name}</code>}
              </div>
              <pre
                aria-labelledby="obsidian-preview-label"
                tabIndex={0}
              >
                {preview ? preview.content : t("obsidian.nothingToPreview")}
              </pre>
            </div>
          </div>
          <p id="obsidian-fields" className="hint">
            {t("obsidian.fields")}{" "}
            <code>
              {TEMPLATE_FIELDS[kind].map(formatField).join("  ")}
            </code>
          </p>
        </fieldset>

        <div className="data-actions">
          <StyledButtonPrimary
            type="button"
            disabled={!status.vaultPath || !folderOk || status.exporting}
            onClick={onExport}
          >
            {t(status.exporting ? "obsidian.exporting" : "obsidian.export")}
          </StyledButtonPrimary>
        </div>
        <p
          className="result"
          role="status"
          data-tone={result && !result.ok ? "error" : undefined}
        >
          {result &&
            (result.ok
              ? t("obsidian.exported", {
                  count: result.written,
                  folder: folder.trim(),
                }) +
                (result.removed
                  ? " " +
                    t("obsidian.removed", { count: result.removed })
                  : "")
              : t(`obsidian.error_${result.error}`))}
        </p>
      </StyledObsidianSection>
    </StyledSettingsSubsection>
  );
};

export default ObsidianSection;
