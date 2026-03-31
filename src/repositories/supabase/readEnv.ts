// Implements: TASK-009, TASK-014 (REQ-024)

type VitePublicEnv = Record<string, string | undefined>;

function getProcessEnv(name: string): string | undefined {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

function getBrowserViteEnv(): VitePublicEnv | undefined {
  return (globalThis as unknown as { __SHARESQUARE_VITE_ENV__?: VitePublicEnv }).__SHARESQUARE_VITE_ENV__;
}

/** Resolve Vite public env: `process.env` in Jest/Node; `import.meta.env` mirror from `src/env-shim.ts` in the browser. */
export function readPublicEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const fromProcess = getProcessEnv(name);
  if (fromProcess) {
    return fromProcess;
  }
  const fromVite = getBrowserViteEnv()?.[name];
  if (fromVite) {
    return fromVite;
  }
  return "";
}

function readOptionalFlag(name: "VITE_USE_SUPABASE_REPOS"): string | undefined {
  const fromProcess = getProcessEnv(name);
  if (fromProcess !== undefined && fromProcess !== "") {
    return fromProcess;
  }
  const fromVite = getBrowserViteEnv()?.[name];
  if (fromVite !== undefined && fromVite !== "") {
    return fromVite;
  }
  return undefined;
}

/** When `true`, `src/repositories/index.ts` wires Supabase implementations (requires URL + anon key). */
export function isSupabaseRepositoriesEnabled(): boolean {
  return readOptionalFlag("VITE_USE_SUPABASE_REPOS") === "true";
}

/**
 * Real Supabase Auth (OAuth / magic link). False when env missing, or in Jest using the default
 * `https://test.supabase.co` placeholder (avoids hitting Auth in component tests).
 */
export function isSupabaseAuthConfigured(): boolean {
  const url = readPublicEnv("VITE_SUPABASE_URL");
  const key = readPublicEnv("VITE_SUPABASE_ANON_KEY");
  if (!url || !key) {
    return false;
  }
  if (url === "https://test.supabase.co") {
    return false;
  }
  return true;
}
