import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { defaultBoard } from "../constants/defaultBoard";

interface BoardState {
  columns: Record<string, Column>;
  columnOrder: string[];
  tasks: Record<string, Task>;
  selectedTaskIds: Set<string>;

  // Actions
  addColumn: (title?: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumnTitle: (columnId: string, title: string) => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  addTask: (columnId: string, title: string) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (
    _taskId: string,
    source: { columnId: string; index: number },
    destination: { columnId: string; index: number }
  ) => void;
  toggleTaskComplete: (taskId: string) => void;
  updateTaskTitle: (taskId: string, title: string) => void;

  // Bulk actions
  deleteSelectedTasks: (taskIds: string[]) => void;
  toggleSelectedTasksCompletion: (
    taskIds: string[],
    completed: boolean
  ) => void;
  moveSelectedTasks: (taskIds: string[], destinationColumnId: string) => void;

  // Selection helpers
  selectTask: (taskId: string, selected: boolean) => void;
  selectAllInColumn: (columnId: string) => void;
  clearSelection: () => void;
}

const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: defaultBoard.columns,
      columnOrder: defaultBoard.columnOrder,
      tasks: defaultBoard.tasks,
      selectedTaskIds: new Set<string>(),

      addColumn: (title = "New Column") =>
        set((state) => {
          const id = nanoid();
          const column: Column = { id, title, taskIds: [] };
          return {
            columns: { ...state.columns, [id]: column },
            columnOrder: [...state.columnOrder, id],
          };
        }),

      deleteColumn: (columnId) =>
        set((state) => {
          const { [columnId]: removed, ...restColumns } = state.columns;
          const remainingTasks = { ...state.tasks };
          removed?.taskIds.forEach((tid) => delete remainingTasks[tid]);
          return {
            columns: restColumns,
            columnOrder: state.columnOrder.filter((id) => id !== columnId),
            tasks: remainingTasks,
            selectedTaskIds: new Set(
              [...state.selectedTaskIds].filter(
                (id) => !removed?.taskIds.includes(id)
              )
            ),
          };
        }),

      moveColumn: (from, to) =>
        set((state) => {
          const newOrder = [...state.columnOrder];
          const [removed] = newOrder.splice(from, 1);
          newOrder.splice(to, 0, removed);
          return { columnOrder: newOrder };
        }),

      addTask: (columnId, title) =>
        set((state) => {
          const id = nanoid();
          const task: Task = { id, title, completed: false };
          const column = state.columns[columnId];
          if (!column) return {};
          return {
            tasks: { ...state.tasks, [id]: task },
            columns: {
              ...state.columns,
              [columnId]: { ...column, taskIds: [...column.taskIds, id] },
            },
          };
        }),

      deleteTask: (taskId) =>
        set((state) => {
          const { [taskId]: removed, ...restTasks } = state.tasks;
          if (!removed) return {};
          const columns = { ...state.columns };
          const colId = Object.keys(columns).find((cid) =>
            columns[cid].taskIds.includes(taskId)
          );
          if (colId) {
            columns[colId] = {
              ...columns[colId],
              taskIds: columns[colId].taskIds.filter((tid) => tid !== taskId),
            };
          }
          const selectedTaskIds = new Set(state.selectedTaskIds);
          selectedTaskIds.delete(taskId);
          return { tasks: restTasks, columns, selectedTaskIds };
        }),

      moveTask: (
        _taskId: string,
        source: { columnId: string; index: number },
        destination: { columnId: string; index: number }
      ) =>
        set((state) => {
          if (!destination) return {};

          if (
            source.columnId === destination.columnId &&
            source.index === destination.index
          ) {
            return {};
          }

          const startColumn = state.columns[source.columnId];
          const finishColumn = state.columns[destination.columnId];

          if (!startColumn || !finishColumn) return {};

          if (startColumn === finishColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            const [movedTask] = newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, movedTask);

            const newColumn = {
              ...startColumn,
              taskIds: newTaskIds,
            };

            return {
              columns: {
                ...state.columns,
                [newColumn.id]: newColumn,
              },
            };
          } else {
            const startTaskIds = Array.from(startColumn.taskIds);
            const [movedTask] = startTaskIds.splice(source.index, 1);
            const newStartColumn = {
              ...startColumn,
              taskIds: startTaskIds,
            };

            const finishTaskIds = Array.from(finishColumn.taskIds);
            finishTaskIds.splice(destination.index, 0, movedTask);
            const newFinishColumn = {
              ...finishColumn,
              taskIds: finishTaskIds,
            };

            return {
              columns: {
                ...state.columns,
                [newStartColumn.id]: newStartColumn,
                [newFinishColumn.id]: newFinishColumn,
              },
            };
          }
        }),

      toggleTaskComplete: (taskId) =>
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return {};

          return {
            tasks: {
              ...state.tasks,
              [taskId]: { ...task, completed: !task.completed },
            },
          };
        }),

      updateTaskTitle: (taskId, title) =>
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return {};

          return { tasks: { ...state.tasks, [taskId]: { ...task, title } } };
        }),

      updateColumnTitle: (columnId, title) =>
        set((state) => {
          const column = state.columns[columnId];
          if (!column) return {};

          return {
            columns: {
              ...state.columns,
              [columnId]: { ...column, title },
            },
          };
        }),

      deleteSelectedTasks: (taskIds) =>
        set((state) => {
          const newTasks = { ...state.tasks };
          const newColumns = JSON.parse(JSON.stringify(state.columns));

          taskIds.forEach((taskId) => {
            delete newTasks[taskId];
          });

          for (const columnId in newColumns) {
            newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(
              (tid: string) => !taskIds.includes(tid)
            );
          }

          return { tasks: newTasks, columns: newColumns };
        }),

      toggleSelectedTasksCompletion: (taskIds, completed) =>
        set((state) => {
          const newTasks = { ...state.tasks };
          taskIds.forEach((taskId) => {
            if (newTasks[taskId]) {
              newTasks[taskId] = { ...newTasks[taskId], completed };
            }
          });
          return { tasks: newTasks };
        }),

      moveSelectedTasks: (taskIds, destinationColumnId) =>
        set((state) => {
          const newColumns = JSON.parse(JSON.stringify(state.columns));

          // 1. remove from old columns
          for (const columnId in newColumns) {
            newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(
              (tid: string) => !taskIds.includes(tid)
            );
          }

          // 2. add to new column
          const destColumn = newColumns[destinationColumnId];
          if (destColumn) {
            const tasksToAdd = taskIds.filter(
              (tid) => !destColumn.taskIds.includes(tid)
            );
            destColumn.taskIds.push(...tasksToAdd);
          }

          return { columns: newColumns };
        }),

      selectTask: (taskId, selected) =>
        set((state) => {
          const next = new Set(state.selectedTaskIds);
          if (selected) {
            next.add(taskId);
          } else {
            next.delete(taskId);
          }
          return { selectedTaskIds: next };
        }),

      selectAllInColumn: (columnId) =>
        set((state) => {
          const next = new Set(state.selectedTaskIds);
          state.columns[columnId]?.taskIds.forEach((id) => next.add(id));
          return { selectedTaskIds: next };
        }),

      clearSelection: () => set({ selectedTaskIds: new Set() }),
    }),
    {
      name: "recman-board",
      partialize: (state) => ({
        columns: state.columns,
        columnOrder: state.columnOrder,
        tasks: state.tasks,
      }),
    }
  )
);

export default useBoardStore;
