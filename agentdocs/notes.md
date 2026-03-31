# Project Notes: sharesquare

> Append-only. Format: `[YYYY-MM-DD TASK-NNN] <fact>`

- [2026-03-31 TASK-001] App entry is Vite 6: `index.html` → `src/main.tsx` → `BrowserRouter` → `Providers` → `AppRoutes`. Legacy Next.js layout and `src/app/globals.css` removed; tokens live in `src/styles/globals.css` with `@tailwindcss/vite`.
- [2026-03-31 TASK-001] `react-router-dom` v7 `useSearchParams()` returns a tuple; use `const [searchParams] = useSearchParams()` for `.get()`.
- [2026-03-31 TASK-001] Jest + `react-router-dom` needs `TextEncoder` / `TextDecoder` on `globalThis` (`jest.setup.ts`).
