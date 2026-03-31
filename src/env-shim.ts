// Implements: TASK-014 (REQ-024)
// Loaded only from `main.tsx` (Vite). Jest does not import this file — keeps `readEnv.ts` free of `import.meta` for Node/ts-jest.

type VitePublicEnv = Record<string, string | undefined>;

(globalThis as unknown as { __SHARESQUARE_VITE_ENV__: VitePublicEnv }).__SHARESQUARE_VITE_ENV__ =
  import.meta.env as VitePublicEnv;
