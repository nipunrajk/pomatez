import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import {
  addBoardCard,
  BOARD_COLUMNS,
  BoardCard,
  BoardColumnId,
  removeBoardCard,
  updateBoardCard,
} from "store";
import {
  StyledButtonDanger,
  StyledButtonNormal,
  StyledButtonPrimary,
  StyledCardDialog,
  StyledCardForm,
  StyledDateInput,
  StyledInput,
  StyledSelect,
  StyledSelectWrapper,
  StyledTextArea,
} from "styles";

export type CardDialogTarget =
  | { mode: "create"; column: BoardColumnId }
  | { mode: "edit"; column: BoardColumnId; card: BoardCard };

type Props = {
  target: CardDialogTarget | null;
  onClose: () => void;
};

const parseTags = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

/** Create or edit a Project Board card in a modal dialog. */
const CardDialog: React.FC<Props> = ({ target, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const columns = useAppSelector((state) => state.board.columns);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [column, setColumn] = useState<BoardColumnId>("pending");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!target) {
      if (dialog.open) {
        dialog.close();
        // Back to whatever opened the dialog, if it's still on the page.
        if (openerRef.current?.isConnected) openerRef.current.focus();
      }
      return;
    }
    const card = target.mode === "edit" ? target.card : null;
    setTitle(card?.title ?? "");
    setCategory(card?.category ?? "");
    setTags(card?.tags.join(", ") ?? "");
    setDueDate(card?.dueDate ?? "");
    setNotes(card?.document ?? "");
    setColumn(target.column);
    setError(false);
    setConfirmDelete(false);
    if (!dialog.open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    }
  }, [target]);

  const categories = Array.from(
    new Set(
      BOARD_COLUMNS.flatMap((id) => columns[id].map((c) => c.category))
    )
  ).filter(Boolean);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError(true);
      (e.currentTarget as HTMLFormElement)
        .querySelector<HTMLInputElement>("#card-title")
        ?.focus();
      return;
    }
    const draft = {
      title: trimmed,
      category: category.trim(),
      tags: parseTags(tags),
      dueDate,
      document: notes.trim(),
    };
    if (target?.mode === "edit") {
      dispatch(
        updateBoardCard({ id: target.card.id, changes: draft, column })
      );
    } else {
      dispatch(addBoardCard(draft, column));
    }
    onClose();
  };

  const onDelete = () => {
    if (target?.mode !== "edit") return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    dispatch(removeBoardCard(target.card.id));
    onClose();
  };

  const editing = target?.mode === "edit";

  return (
    <StyledCardDialog
      ref={dialogRef}
      aria-labelledby="card-dialog-title"
      // Esc: let React state drive closing so it stays in sync.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <StyledCardForm onSubmit={onSubmit} noValidate>
        <h2 id="card-dialog-title">
          {t(
            editing ? "controlPanel.editCard" : "controlPanel.newCard"
          )}
        </h2>

        <label className="wide">
          {t("controlPanel.fieldTitle")}
          <StyledInput
            id="card-title"
            value={title}
            required
            aria-invalid={error}
            aria-describedby={error ? "card-title-error" : undefined}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(false);
            }}
          />
          {error && (
            <span id="card-title-error" className="form-error">
              {t("controlPanel.titleRequired")}
            </span>
          )}
        </label>

        <label>
          {t("controlPanel.fieldCategory")}
          <StyledInput
            value={category}
            list="card-categories"
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="card-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label>
          {t("controlPanel.fieldColumn")}
          <StyledSelectWrapper>
            <StyledSelect
              value={column}
              onChange={(e) =>
                setColumn(e.target.value as BoardColumnId)
              }
            >
              {BOARD_COLUMNS.map((id) => (
                <option key={id} value={id}>
                  {t(`controlPanel.${id}`)}
                </option>
              ))}
            </StyledSelect>
          </StyledSelectWrapper>
        </label>

        <label>
          {t("controlPanel.fieldTags")}
          <StyledInput
            value={tags}
            placeholder={t("controlPanel.tagsHint")}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>

        <label>
          {t("controlPanel.fieldDueDate")}
          <StyledDateInput
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <label className="wide">
          {t("controlPanel.fieldDocument")}
          <StyledTextArea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="form-footer">
          {editing && (
            <StyledButtonDanger type="button" onClick={onDelete}>
              {t(
                confirmDelete
                  ? "controlPanel.confirmDelete"
                  : "controlPanel.deleteCard"
              )}
            </StyledButtonDanger>
          )}
          <div className="form-buttons">
            <StyledButtonNormal type="button" onClick={onClose}>
              {t("controlPanel.cancel")}
            </StyledButtonNormal>
            <StyledButtonPrimary type="submit">
              {t(
                editing
                  ? "controlPanel.save"
                  : "controlPanel.createCard"
              )}
            </StyledButtonPrimary>
          </div>
        </div>
      </StyledCardForm>
    </StyledCardDialog>
  );
};

export default CardDialog;
