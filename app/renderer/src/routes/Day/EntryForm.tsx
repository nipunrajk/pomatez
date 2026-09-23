import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EntryDraft, EntryMode } from "store";
import {
  StyledButtonNormal,
  StyledButtonPrimary,
  StyledEntryForm,
  StyledInput,
  StyledModeToggle,
  StyledEntryTimeInput,
} from "styles";

type Props = {
  initial: EntryDraft;
  submitLabel: string;
  onSubmit: (draft: EntryDraft) => void;
  onCancel: () => void;
};

const EntryForm: React.FC<Props> = ({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<EntryDraft>(initial);
  const [error, setError] = useState("");

  const set =
    <K extends keyof EntryDraft>(key: K) =>
    (value: EntryDraft[K]) =>
      setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setError(t("day.errorTitle"));
      return;
    }
    if (draft.start && draft.end && draft.end <= draft.start) {
      setError(t("day.errorRange"));
      return;
    }
    onSubmit({ ...draft, title, tag: draft.tag.trim() });
  };

  return (
    <StyledEntryForm
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <label>
        {t("day.title")}
        <StyledInput
          autoFocus
          value={draft.title}
          placeholder={t("day.titlePlaceholder")}
          onChange={(e) => set("title")(e.target.value)}
        />
      </label>
      <label>
        {t("day.tag")}
        <StyledInput
          value={draft.tag}
          placeholder={t("day.tagPlaceholder")}
          onChange={(e) => set("tag")(e.target.value)}
        />
      </label>
      <label>
        {t("day.start")}
        <StyledEntryTimeInput
          value={draft.start}
          onChange={(e) => set("start")(e.target.value)}
        />
      </label>
      <label>
        {t("day.end")}
        <StyledEntryTimeInput
          value={draft.end}
          onChange={(e) => set("end")(e.target.value)}
        />
      </label>
      <label>
        {t("day.mode")}
        <StyledModeToggle>
          {[EntryMode.STOPWATCH, EntryMode.POMODORO].map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={draft.mode === mode}
              onClick={() => set("mode")(mode)}
            >
              {t(`day.mode_${mode}`)}
            </button>
          ))}
        </StyledModeToggle>
      </label>

      <div className="form-footer">
        <span className="form-error">{error}</span>
        <div className="form-buttons">
          <StyledButtonNormal type="button" onClick={onCancel}>
            {t("day.cancel")}
          </StyledButtonNormal>
          <StyledButtonPrimary type="submit">
            {submitLabel}
          </StyledButtonPrimary>
        </div>
      </div>
    </StyledEntryForm>
  );
};

export default EntryForm;
