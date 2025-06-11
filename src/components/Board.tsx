import { useEffect, useState, useRef, useCallback } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index";
import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import useBoardStore from "../store/boardStore";
import { Button, Input, FilterButton, Select, Text } from "./ui";
import Column from "./Column";
import styles from "./Board.module.css";

const Board = () => {
  const boardColumns = useBoardStore((state) => state.columns);
  const boardColumnOrder = useBoardStore((state) => state.columnOrder);
  const boardTasks = useBoardStore((state) => state.tasks);
  const {
    moveColumn,
    moveTask,
    addColumn,
    deleteSelectedTasks,
    toggleSelectedTasksCompletion,
    moveSelectedTasks,
    selectedTaskIds,
    selectTask,
    clearSelection,
  } = useBoardStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "incomplete"
  >("all");

  const columnsContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);

  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const startAutoScroll = useCallback((direction: "left" | "right") => {
    if (autoScrollIntervalRef.current) return;

    const container = columnsContainerRef.current;
    if (!container) return;

    const scrollSpeed = 8;
    autoScrollIntervalRef.current = window.setInterval(() => {
      if (direction === "left") {
        container.scrollLeft = Math.max(0, container.scrollLeft - scrollSpeed);
      } else {
        container.scrollLeft = Math.min(
          container.scrollWidth - container.clientWidth,
          container.scrollLeft + scrollSpeed
        );
      }
    }, 16);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      const container = columnsContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const scrollThreshold = 100;

      const distanceFromLeft = clientX - containerRect.left;
      const distanceFromRight = containerRect.right - clientX;

      // Stop any existing auto-scroll
      stopAutoScroll();

      // Start auto-scroll if near edges
      if (distanceFromLeft < scrollThreshold && container.scrollLeft > 0) {
        startAutoScroll("left");
      } else if (
        distanceFromRight < scrollThreshold &&
        container.scrollLeft < container.scrollWidth - container.clientWidth
      ) {
        startAutoScroll("right");
      }
    },
    [startAutoScroll, stopAutoScroll]
  );

  // Set up the global monitor for drag and drop events
  useEffect(() => {
    return monitorForElements({
      onDragStart({ source }) {
        // Reset any existing auto-scroll when drag starts
        stopAutoScroll();

        // Track column drag start
        if (source.data.type === "column") {
          setDraggedColumnId(String(source.data.columnId));
        }
      },
      onDrag({ location, source }) {
        // Handle auto-scrolling during drag
        if (location.current.input.clientX !== undefined) {
          handleDragMove(location.current.input.clientX);
        }

        // Handle drop indicators for column reordering
        if (source.data.type === "column") {
          const destination = location.current.dropTargets[0];
          if (destination && destination.data.type === "column") {
            const targetColumnId = String(destination.data.columnId);
            const closestEdge = extractClosestEdge(destination.data);

            setTargetColumnId(targetColumnId);
            setClosestEdge(closestEdge);
          } else {
            setTargetColumnId(null);
            setClosestEdge(null);
          }
        }
      },
      onDrop({ source, location }) {
        // Stop auto-scrolling when drag ends
        stopAutoScroll();

        // Clear drop indicators
        setDraggedColumnId(null);
        setTargetColumnId(null);
        setClosestEdge(null);

        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const sourceData = source.data;
        const destinationData = destination.data;

        // Handle column reordering
        if (sourceData.type === "column" && destinationData.type === "column") {
          if (!boardColumnOrder) return;
          const startIndex = boardColumnOrder.indexOf(
            String(sourceData.columnId)
          );
          const indexOfTarget = boardColumnOrder.indexOf(
            String(destinationData.columnId)
          );

          if (
            startIndex !== -1 &&
            indexOfTarget !== -1 &&
            startIndex !== indexOfTarget
          ) {
            // Extract the closest edge to determine insertion position
            const closestEdgeOfTarget = extractClosestEdge(destinationData);

            // Calculate the proper insertion index using the reorder utility
            const finishIndex = getReorderDestinationIndex({
              startIndex,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: "horizontal",
            });

            moveColumn(startIndex, finishIndex);
          }
        }

        // Handle task movement
        if (sourceData.type === "task") {
          const sourceColumnId = String(sourceData.columnId);
          const sourceTaskId = String(sourceData.taskId);

          let destinationColumnId: string;
          let destinationIndex: number;

          if (destinationData.type === "task") {
            destinationColumnId = String(destinationData.columnId);
            const destColumn = boardColumns[destinationColumnId];
            if (!destColumn) return;
            destinationIndex = destColumn.taskIds.indexOf(
              String(destinationData.taskId)
            );
          } else if (destinationData.type === "column") {
            destinationColumnId = String(destinationData.columnId);
            const destColumn = boardColumns[destinationColumnId];
            if (!destColumn) return;
            destinationIndex = destColumn.taskIds.length;
          } else {
            return;
          }

          if (!boardColumns) return;

          const sourceColumn = boardColumns[sourceColumnId];

          if (!sourceColumn) return;
          const sourceIndex = sourceColumn.taskIds.indexOf(sourceTaskId);

          // Don't move if it's the same position
          if (
            sourceColumnId === destinationColumnId &&
            sourceIndex === destinationIndex
          ) {
            return;
          }

          moveTask(
            sourceTaskId,
            { columnId: sourceColumnId, index: sourceIndex },
            { columnId: destinationColumnId, index: destinationIndex }
          );
        }
      },
    });
  }, [
    boardColumns,
    boardColumnOrder,
    boardTasks,
    moveColumn,
    moveTask,
    handleDragMove,
    stopAutoScroll,
  ]);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll]);

  // key shortcuts for search and filter
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case "c":
        e.preventDefault();
        setFilterStatus("completed");
        break;
      case "i":
        e.preventDefault();
        setFilterStatus("incomplete");
        break;
      case "a":
        e.preventDefault();
        setFilterStatus("all");
        break;
      case "f":
        e.preventDefault();
        focusSearchInput();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!boardColumns || !boardColumnOrder) return null;

  const handleClearSelection = () => clearSelection();

  const handleDeleteSelected = () => {
    deleteSelectedTasks(Array.from(selectedTaskIds));
    handleClearSelection();
  };

  const handleToggleSelectedComplete = (completed: boolean) => {
    toggleSelectedTasksCompletion(Array.from(selectedTaskIds), completed);
    handleClearSelection();
  };

  const handleMoveSelected = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const columnId = e.target.value;
    if (!columnId) return;
    moveSelectedTasks(Array.from(selectedTaskIds), columnId);
    handleClearSelection();
    e.target.value = "";
  };

  const focusSearchInput = () => {
    const searchInput = document.querySelector("input[type='text']");
    if (searchInput) {
      (searchInput as HTMLInputElement).focus();
    }
  };

  const toggleSelectTask = (id: string, selected: boolean) => {
    selectTask(id, selected);
  };

  const handleSelectAllInColumn = (taskIds: string[]) => {
    taskIds.forEach((id) => selectTask(id, true));
  };

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.bulkActions}>
        <Text weight="bold">{selectedTaskIds.size} tasks selected</Text>
        <Button
          onClick={handleDeleteSelected}
          disabled={selectedTaskIds.size === 0}
          variant="danger"
          size="small"
        >
          Delete
        </Button>
        <Button
          onClick={() => handleToggleSelectedComplete(true)}
          disabled={selectedTaskIds.size === 0}
          variant="primary"
          size="small"
        >
          Mark Complete
        </Button>
        <Button
          onClick={() => handleToggleSelectedComplete(false)}
          disabled={selectedTaskIds.size === 0}
          variant="secondary"
          size="small"
        >
          Mark Incomplete
        </Button>
        <Select
          onChange={handleMoveSelected}
          defaultValue=""
          size="small"
          disabled={selectedTaskIds.size === 0 || boardColumnOrder.length === 0}
        >
          <option value="" disabled>
            Move to...
          </option>
          {boardColumnOrder.map((cid) => (
            <option key={cid} value={cid}>
              {boardColumns[cid].title}
            </option>
          ))}
        </Select>
        <Button
          onClick={handleClearSelection}
          disabled={selectedTaskIds.size === 0}
          variant="ghost"
          size="small"
        >
          Clear Selection
        </Button>
      </div>
      <div className={styles.controls}>
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          variant="search"
        />
        <div className={styles.filters}>
          <FilterButton
            onClick={() => setFilterStatus("all")}
            active={filterStatus === "all"}
          >
            All
          </FilterButton>
          <FilterButton
            onClick={() => setFilterStatus("completed")}
            active={filterStatus === "completed"}
          >
            Completed
          </FilterButton>
          <FilterButton
            onClick={() => setFilterStatus("incomplete")}
            active={filterStatus === "incomplete"}
          >
            Incomplete
          </FilterButton>
        </div>
      </div>

      <div className={styles.columnsContainer} ref={columnsContainerRef}>
        {boardColumnOrder.map((columnID) => (
          <div key={columnID} style={{ position: "relative" }}>
            {/* Drop indicator before a column */}
            {draggedColumnId &&
              targetColumnId === columnID &&
              closestEdge === "left" && <DropIndicator edge="left" gap="8px" />}

            <Column
              columnId={columnID}
              selectedTaskIds={selectedTaskIds}
              toggleSelectTask={toggleSelectTask}
              selectAllInColumn={handleSelectAllInColumn}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
            />

            {/* Drop indicator after a column */}
            {draggedColumnId &&
              targetColumnId === columnID &&
              closestEdge === "right" && (
                <DropIndicator edge="right" gap="8px" />
              )}
          </div>
        ))}
        <Button className={styles.addColumnButton} onClick={() => addColumn()}>
          + Add Column
        </Button>
      </div>
    </div>
  );
};

export default Board;
