import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useModalDialog } from "hooks/useModalDialog";
import {
  addMilestone,
  MILESTONE_STATUSES,
  MilestoneStatus,
  setTaskListDetails,
  TaskList,
} from "store";
import {
  StyledButtonNormal,
  StyledButtonPrimary,
  StyledCardDialog,
  StyledCardForm,
  StyledDateInput,
  StyledInput,
  StyledSelect,
  StyledSelectWrapper,
} from "styles";

export type MilestoneDialogTarget =
  | { mode: "create" }
  | { mode: "edit"; list: TaskList };

type Props = {
  target: MilestoneDialogTarget | null;
  onClose: () => void;
};

/**
 * Create a milestone (a new Task List list) or edit one's details:
 * category, status and deadline.
 */
const MilestoneDialog: React.FC<Props> = ({ target, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const lists = useAppSelector((state) => state.tasks.present);
  const dialogRef = useModalDialog(!!target);
  const list = target?.mode === "edit" ? target.list : null;
  const creating = target?.mode === "create";

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<MilestoneStatus>("ongoing");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (!target) return;
    const current = target.mode === "edit" ? target.list : null;
    setTitle("");
    setTitleError(false);
    setCategory(current?.category ?? "");
    setStatus(current?.status ?? "ongoing");
    setDeadline(current?.deadline ?? "");
  }, [target]);

  const categories = Array.from(
    new Set(lists.map((l) => l.category).filter(Boolean))
  ) as string[];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const details = {
      category: category.trim() || undefined,
      status,
      deadline: deadline || undefined,
    };
    if (creating) {
      if (!title.trim()) {
        setTitleError(true);
        (e.currentTarget as HTMLFormElement)
          .querySelector<HTMLInputElement>("#milestone-title")
          ?.focus();
        return;
      }
      dispatch(addMilestone({ title, ...details }));
    } else if (list) {
      dispatch(setTaskListDetails({ listId: list._id, ...details }));
    }
    onClose();
  };

  return (
    <StyledCardDialog
      ref={dialogRef}
      aria-labelledby="milestone-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <StyledCardForm onSubmit={onSubmit} noValidate>
        <h2 id="milestone-dialog-title">
          {creating
            ? t("controlPanel.newMilestone")
            : t("controlPanel.milestoneDetailsFor", {
                title: list?.title ?? "",
              })}
        </h2>

        {creating && (
          <label className="wide">
            {t("controlPanel.fieldTitle")}
            <StyledInput
              id="milestone-title"
              value={title}
              required
              aria-invalid={titleError}
              aria-describedby={
                titleError ? "milestone-title-error" : undefined
              }
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(false);
              }}
            />
            {titleError && (
              <span id="milestone-title-error" className="form-error">
                {t("controlPanel.milestoneTitleRequired")}
              </span>
            )}
          </label>
        )}

        <label className="wide">
          {t("controlPanel.fieldCategory")}
          <StyledInput
            value={category}
            list="milestone-categories"
            placeholder={t("controlPanel.milestoneCategoryHint")}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="milestone-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label>
          {t("controlPanel.fieldStatus")}
          <StyledSelectWrapper>
            <StyledSelect
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as MilestoneStatus)
              }
            >
              {MILESTONE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`controlPanel.status_${s}`)}
                </option>
              ))}
            </StyledSelect>
          </StyledSelectWrapper>
        </label>

        <label>
          {t("controlPanel.fieldDeadline")}
          <StyledDateInput
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <div className="form-footer">
          <div className="form-buttons">
            <StyledButtonNormal type="button" onClick={onClose}>
              {t("controlPanel.cancel")}
            </StyledButtonNormal>
            <StyledButtonPrimary type="submit">
              {t(
                creating ? "controlPanel.createMilestone" : "controlPanel.save"
              )}
            </StyledButtonPrimary>
          </div>
        </div>
      </StyledCardForm>
    </StyledCardDialog>
  );
};

export default MilestoneDialog;
