import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPersistedState } from "store";
import {
  BackupFile,
  backupFileName,
  buildBackup,
  parseBackup,
  saveToStorage,
} from "utils";
import {
  StyledButtonDanger,
  StyledButtonNormal,
  StyledDataSection,
  StyledSettingsSubsection,
} from "styles";
import Json from "../../../package.json";

/** Kept by an import, in case the backup wasn't the one you meant. */
const PRE_IMPORT_KEY = "state_before_import";

const countItems = (backup: BackupFile) => {
  const { tasks, board, entries } = backup.data as {
    tasks?: unknown[];
    board?: { columns: Record<string, unknown[]> };
    entries?: { items: unknown[] };
  };
  return {
    milestones: tasks?.length ?? 0,
    cards: board
      ? Object.values(board.columns).reduce((n, c) => n + c.length, 0)
      : 0,
    entries: entries?.items.length ?? 0,
  };
};

/** Settings → Data: save everything to a JSON file, or restore from one. */
const DataSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<BackupFile | null>(null);

  const onExport = () => {
    const backup = buildBackup(getPersistedState(), Json.version);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      })
    );
    const name = backupFileName();
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    // The save dialog is the feedback; clear any earlier import message.
    setPending(null);
    setError("");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Lets the same file be picked again after a Cancel.
    e.target.value = "";
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      setPending(null);
      setError(t(`data.error_${result.error}`));
      return;
    }
    setError("");
    setPending(result.backup);
  };

  const onReplace = () => {
    if (!pending) return;
    saveToStorage(PRE_IMPORT_KEY, getPersistedState());
    saveToStorage("state", pending.data);
    // Every store reads "state" when it's created, so reload to apply it.
    window.location.reload();
  };

  const exportedAt = pending
    ? new Date(pending.exportedAt).toLocaleString(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <StyledSettingsSubsection>
      <h5>{t("data.heading")}</h5>
      <StyledDataSection>
        <p>{t("data.description")}</p>
        <div className="data-actions">
          <StyledButtonNormal type="button" onClick={onExport}>
            {t("data.export")}
          </StyledButtonNormal>
          <StyledButtonNormal
            ref={importRef}
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            {t("data.import")}
          </StyledButtonNormal>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            tabIndex={-1}
            aria-hidden="true"
            onChange={onFile}
          />
        </div>

        {pending && (
          <div
            className="data-confirm"
            role="group"
            aria-labelledby="data-confirm-text"
          >
            <p id="data-confirm-text">
              {t("data.confirm", {
                date: exportedAt,
                ...countItems(pending),
              })}
            </p>
            <div className="data-actions">
              <StyledButtonDanger type="button" onClick={onReplace}>
                {t("data.replace")}
              </StyledButtonDanger>
              {/* Focus lands on the safe choice. */}
              <StyledButtonNormal
                type="button"
                autoFocus
                onClick={() => {
                  setPending(null);
                  importRef.current?.focus();
                }}
              >
                {t("data.cancel")}
              </StyledButtonNormal>
            </div>
          </div>
        )}

        {error && (
          <p className="data-error" role="alert">
            {error}
          </p>
        )}
      </StyledDataSection>
    </StyledSettingsSubsection>
  );
};

export default DataSection;
