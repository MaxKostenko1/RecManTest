export const defaultBoard: BoardData = {
  columns: {
    "col-todo": {
      id: "col-todo",
      title: "Todo",
      taskIds: ["task-1", "task-2"],
    },
    "col-inprogress": {
      id: "col-inprogress",
      title: "In Progress",
      taskIds: ["task-3"],
    },
    "col-done": { id: "col-done", title: "Done", taskIds: ["task-4"] },
  },
  columnOrder: ["col-todo", "col-inprogress", "col-done"],
  tasks: {
    "task-1": { id: "task-1", title: "Design UI", completed: false },
    "task-2": { id: "task-2", title: "Set up project", completed: true },
    "task-3": {
      id: "task-3",
      title: "Implement drag & drop",
      completed: false,
    },
    "task-4": { id: "task-4", title: "Write README", completed: true },
  },
};
