import { useState, useEffect, useRef, useCallback } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import useBoardStore from "../store/boardStore";
import { Button, Input, IconButton, Text } from "./ui";
import TaskCard from "./TaskCard";
import styles from "./Column.module.css";

interface Props {
  columnId: string;
  selectedTaskIds: Set<string>;
  toggleSelectTask: (id: string, selected: boolean) => void;
  selectAllInColumn: (taskIds: string[]) => void;
  searchQuery: string;
  filterStatus: "all" | "completed" | "incomplete";
}

const Column = ({
  columnId,
  selectedTaskIds,
  toggleSelectTask,
  selectAllInColumn,
  searchQuery,
  filterStatus,
}: Props) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const titleEditRef = useRef<HTMLDivElement>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const boardColumns = useBoardStore((state) => state.columns);
  const boardTasks = useBoardStore((state) => state.tasks);
  const { addTask, deleteColumn, updateColumnTitle } = useBoardStore();

  const handleSaveTitle = () => {
    if (draftTitle.trim()) {
      updateColumnTitle(columnId, draftTitle.trim());
    }
    setIsEditingTitle(false);
    setDraftTitle("");
  };

  const handleCancelEdit = useCallback(() => {
    setIsEditingTitle(false);
    setDraftTitle("");
  }, []);

  // Handle click outside to cancel title editing
  useEffect(() => {
    if (!isEditingTitle) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        titleEditRef.current &&
        !titleEditRef.current.contains(event.target as Node)
      ) {
        handleCancelEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingTitle, handleCancelEdit]);

  // Set up drag and drop for the column
  useEffect(() => {
    if (!columnRef.current) return;

    return combine(
      // Make the column draggable
      draggable({
        element: columnRef.current,
        getInitialData: () => ({
          type: "column",
          columnId,
        }),
      }),

      // Make the column a drop target for tasks and other columns
      dropTargetForElements({
        element: columnRef.current,
        canDrop({ source }) {
          // Allow dropping tasks or other columns
          return source.data.type === "task" || source.data.type === "column";
        },
        getData: ({ input, element }) => {
          const data = {
            type: "column",
            columnId,
          };

          // Attach closest edge data for column reordering
          return attachClosestEdge(data, {
            input,
            element,
            allowedEdges: ["left", "right"],
          });
        },
        onDragEnter: ({ source }) => {
          // Only highlight when dragging tasks, not columns
          if (source.data.type === "task") {
            setIsDraggedOver(true);
          }
        },
        onDragLeave: ({ source }) => {
          // Only remove highlight when dragging tasks, not columns
          if (source.data.type === "task") {
            setIsDraggedOver(false);
          }
        },
        onDrop: ({ source }) => {
          // Only remove highlight when dropping tasks, not columns
          if (source.data.type === "task") {
            setIsDraggedOver(false);
          }
        },
      })
    );
  }, [columnId]);

  const column = boardColumns[columnId];
  if (!column) return null;

  const tasks = column.taskIds
    .map((tid) => boardTasks[tid])
    .filter((task) => {
      if (!task) return false;
      const searchMatch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const filterMatch =
        filterStatus === "all" ||
        (filterStatus === "completed" && task.completed) ||
        (filterStatus === "incomplete" && !task.completed);
      return searchMatch && filterMatch;
    });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(columnId, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const handleStartEditingTitle = () => {
    setIsEditingTitle(true);
    setDraftTitle(column.title);
  };

  return (
    <div
      ref={columnRef}
      className={`${styles.column} ${isDraggedOver ? styles.draggedOver : ""}`}
    >
      <div className={styles.header}>
        {isEditingTitle ? (
          <div className={styles.titleEditContainer} ref={titleEditRef}>
            <Input
              className={styles.titleEditInput}
              value={draftTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDraftTitle(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") handleCancelEdit();
              }}
              autoFocus
            />
            <div className={styles.titleEditButtons}>
              <IconButton
                variant="save"
                onClick={handleSaveTitle}
                title="Save"
                icon="✓"
              />
              <IconButton
                variant="cancel"
                onClick={handleCancelEdit}
                title="Cancel"
                icon="✕"
              />
            </div>
          </div>
        ) : (
          <Text
            as="h3"
            variant="subtitle"
            className={styles.columnTitle}
            onClick={handleStartEditingTitle}
          >
            {column.title}
          </Text>
        )}
        <IconButton
          variant="delete"
          className={styles.deleteBtn}
          onClick={() => deleteColumn(columnId)}
          icon="✕"
        />
      </div>
      <div className={styles.actionBar}>
        <Input
          className={styles.addInput}
          value={newTaskTitle}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewTaskTitle(e.target.value)
          }
          placeholder="Add new task"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === "Enter" && handleAddTask()
          }
        />
        <Button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
          size="small"
        >
          Add
        </Button>
        <Button
          onClick={() => selectAllInColumn(tasks.map((t) => t.id))}
          disabled={selectedTaskIds.size === tasks.length}
          size="small"
          variant="ghost"
        >
          Select All
        </Button>
      </div>
      <div className={styles.tasksList}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            taskId={task.id}
            columnId={columnId}
            selected={selectedTaskIds.has(task.id)}
            toggleSelectTask={toggleSelectTask}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;
