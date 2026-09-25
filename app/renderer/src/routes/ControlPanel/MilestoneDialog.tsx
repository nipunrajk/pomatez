import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useModalDialog } from "hooks/useModalDialog";
import {
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

type Props = {
  list: TaskList | null;
  onClose: () => void;
};

/** Edit a Task List list's milestone details: category, status, deadline. */
const MilestoneDialog: React.FC<Props> = ({ list, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const lists = useAppSelector((state) => state.tasks.present);
  const dialogRef = useModalDialog(!!list);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<MilestoneStatus>("ongoing");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (!list) return;
    setCategory(list.category ?? "");
    setStatus(list.status ?? "ongoing");
    setDeadline(list.deadline ?? "");
  }, [list]);

  const categories = Array.from(
    new Set(lists.map((l) => l.category).filter(Boolean))
  ) as string[];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!list) return;
    dispatch(
      setTaskListDetails({
        listId: list._id,
        category: category.trim() || undefined,
        status,
        deadline: deadline || undefined,
      })
    );
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
          {t("controlPanel.milestoneDetailsFor", {
            title: list?.title ?? "",
          })}
        </h2>

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
              {t("controlPanel.save")}
            </StyledButtonPrimary>
          </div>
        </div>
      </StyledCardForm>
    </StyledCardDialog>
  );
};

export default MilestoneDialog;
