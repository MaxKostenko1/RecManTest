import { useState, useEffect, useRef, useCallback } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import useBoardStore from "../store/boardStore";
import { Input, IconButton, Checkbox } from "./ui";
import styles from "./TaskCard.module.css";

interface Props {
  taskId: string;
  columnId: string;
  selected: boolean;
  toggleSelectTask: (id: string, selected: boolean) => void;
  searchQuery: string;
}

const TaskCard = ({
  taskId,
  columnId,
  selected,
  toggleSelectTask,
  searchQuery,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  const boardTasks = useBoardStore((state) => state.tasks);
  const { toggleTaskComplete, deleteTask, updateTaskTitle } = useBoardStore();

  const task = boardTasks[taskId];
  const [draftTitle, setDraftTitle] = useState(task?.title || "");

  const handleSave = () => {
    if (draftTitle.trim()) {
      updateTaskTitle(task.id, draftTitle.trim());
    }
    setEditing(false);
  };

  const handleCancel = useCallback(() => {
    setDraftTitle(task.title);
    setEditing(false);
  }, [task.title]);

  // Handle click outside to cancel task title editing
  useEffect(() => {
    if (!editing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editing, handleCancel]);

  // Set up drag and drop for the task
  useEffect(() => {
    if (!taskRef.current) return;

    return combine(
      // Make the task draggable
      draggable({
        element: taskRef.current,
        getInitialData: () => ({
          type: "task",
          taskId,
          columnId,
        }),
      }),

      // Make the task a drop target for other tasks
      dropTargetForElements({
        element: taskRef.current,
        canDrop({ source }) {
          return source.data.type === "task" && source.data.taskId !== taskId;
        },
        getData: () => ({
          type: "task",
          taskId,
          columnId,
        }),
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: () => setIsDraggedOver(false),
      })
    );
  }, [taskId, columnId]);

  if (!task) return null;

  const handleStartEditing = () => {
    setEditing(true);
    setDraftTitle(task.title);
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i}>{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div
      ref={taskRef}
      className={`${styles.card} ${isDraggedOver ? styles.draggedOver : ""}`}
    >
      {editing ? (
        <div className={styles.editContainer} ref={editContainerRef}>
          <Checkbox
            variant="task"
            className={styles.taskCheckbox}
            checked={task.completed}
            onChange={() => toggleTaskComplete(task.id)}
          />
          <div className={styles.editInputContainer}>
            <Input
              className={styles.editInput}
              value={draftTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDraftTitle(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
            />
            <div className={styles.editButtons}>
              <IconButton
                variant="save"
                onClick={handleSave}
                title="Save"
                icon="✓"
              />
              <IconButton
                variant="cancel"
                onClick={handleCancel}
                title="Cancel"
                icon="✕"
              />
            </div>
          </div>
          <Checkbox
            variant="select"
            className={styles.selectCheckbox}
            checked={selected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              toggleSelectTask(task.id, e.target.checked)
            }
          />
        </div>
      ) : (
        <div className={styles.taskCard}>
          <Checkbox
            variant="task"
            className={styles.taskCheckbox}
            checked={task.completed}
            onChange={() => toggleTaskComplete(task.id)}
          />
          <div
            className={`${styles.taskTitle} ${
              task.completed ? styles.completed : ""
            }`}
            onClick={handleStartEditing}
          >
            {getHighlightedText(task.title, searchQuery)}
          </div>
          <Checkbox
            variant="select"
            className={styles.selectCheckbox}
            checked={selected}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              toggleSelectTask(task.id, e.target.checked)
            }
          />
          <IconButton
            variant="delete"
            className={styles.deleteBtn}
            onClick={() => deleteTask(task.id)}
            title="Delete task"
            icon="✕"
          />
        </div>
      )}
    </div>
  );
};

export default TaskCard;
