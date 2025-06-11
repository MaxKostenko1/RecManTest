# RecMan Todo Board

A responsive Kanban-style todo application built with **React**, **TypeScript**, **Vite**, **Zustand** for state-management and **dnd-kit** for drag-and-drop.

## ✨ Features

• Add / delete columns.
• Drag & drop to reorder columns.
• Add / delete todo tasks in any column.
• Mark tasks complete / incomplete.
• Inline edit task titles.
• Re-order tasks inside a column with drag-and-drop.
• Multi-select tasks for bulk actions (select check-box).
• Persist data to `localStorage` – your board survives page refresh.
• Responsive layout – works great on desktop and mobile.

_Planned enhancements_

- Move tasks across columns by drag-and-drop.
- Global search & smart filtering.
- Highlight search matches.

## 📦 Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the dev server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the port shown in your terminal).

3. **Create production build**

   ```bash
   npm run build
   npm run preview # preview the production build locally
   ```

## 🗂 Project structure

```
src/
  components/   # Presentational + container components (Board, Column, TaskCard)
  store/        # Zustand store that holds board state (tasks, columns, selection)
  types.ts      # Shared TS types
  vite-env.d.ts # Vite/TS helpers incl. CSS-modules typings
```

## 📝 Scripts

| command           | description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | start Vite dev server with HMR |
| `npm run build`   | generate production build      |
| `npm run preview` | preview production build       |
| `npm run lint`    | run ESLint                     |

## 🌐 Demo

Can be acceses by this [link](https://courageous-stardust-545090.netlify.app/)


