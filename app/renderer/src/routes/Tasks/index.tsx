import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "hooks";
import { ActionCreators as UndoActionCreator } from "redux-undo";
import {
  DragDropContext,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import {
  StyledTaskContainer,
  StyledTaskStickySection,
  StyledTaskWrapper,
  StyledTaskMain,
} from "styles";
import { addTaskList, dragList } from "store";
import { Header } from "components";

import TaskFormButton from "./TaskFormButton";
import TaskInnerList from "./TaskInnerList";

export default function Tasks() {
  const { t } = useTranslation();
  const tasks = useAppSelector((state) => state.tasks);

  const dispatch = useAppDispatch();

  // Control Panel's "Create New" lands here (?add=list) with the add-list
  // form open. Hash history drops location state, hence the query string.
  const history = useHistory();
  const location = useLocation();
  const [openAddList] = useState(
    () => new URLSearchParams(location.search).get("add") === "list"
  );
  useEffect(() => {
    if (openAddList) history.replace(location.pathname);
    // Only clear the one-shot flag once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onListAdd = (value: string) => dispatch(addTaskList(value));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    dispatch(
      dragList({
        sourceId: source.droppableId,
        destinationId: destination.droppableId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
        draggableId,
        type,
      })
    );
  };

  useEffect(() => {
    function registerUndoRedoKeys(e: KeyboardEvent) {
      const activeElement = document.activeElement?.tagName;

      if (activeElement !== "INPUT" && activeElement !== "TEXTAREA") {
        if (e.ctrlKey && e.code === "KeyZ") {
          if (tasks.past.length > 0) {
            // @ts-ignore This is a problem with redux-undo types
            dispatch(UndoActionCreator.undo());
          }
        }

        if (e.ctrlKey && e.shiftKey && e.code === "KeyZ") {
          if (tasks.future.length > 0) {
            // @ts-ignore This is a problem with redux-undo types
            dispatch(UndoActionCreator.redo());
          }
        }
      }
    }

    document.addEventListener("keydown", registerUndoRedoKeys);
    return () =>
      document.removeEventListener("keydown", registerUndoRedoKeys);
  }, [dispatch, tasks.past.length, tasks.future.length]);

  return (
    <StyledTaskMain>
      <Header heading={t("nav.taskList")} wide />
      <DragDropContext onDragEnd={onDragEnd}>
        <StyledTaskContainer>
          <Droppable
            droppableId="task-list"
            direction="horizontal"
            type="list"
          >
            {(provided) => (
              <StyledTaskWrapper
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <TaskInnerList tasks={tasks.present} />

                {provided.placeholder}

                <StyledTaskStickySection>
                  <TaskFormButton
                    forList
                    defaultOpen={openAddList}
                    onSubmit={onListAdd}
                  />
                </StyledTaskStickySection>
              </StyledTaskWrapper>
            )}
          </Droppable>
        </StyledTaskContainer>
      </DragDropContext>
    </StyledTaskMain>
  );
}
