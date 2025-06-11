declare global {
  interface Task {
    id: string;
    title: string;
    completed: boolean;
  }

  interface Column {
    id: string;
    title: string;
    taskIds: string[];
  }

  interface BoardData {
    columns: Record<string, Column>;
    columnOrder: string[];
    tasks: Record<string, Task>;
  }
}

export {};
