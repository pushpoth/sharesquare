// Implements: TASK-009, TASK-014 (REQ-024)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readPublicEnv } from "./readEnv";

export function createBrowserSupabaseClient(): SupabaseClient {
  const url = readPublicEnv("VITE_SUPABASE_URL");
  const anonKey = readPublicEnv("VITE_SUPABASE_ANON_KEY");
  if (!url || !anonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  }
  return createClient(url, anonKey);
}

let sharedClient: SupabaseClient | null = null;

/** Single browser client for the app (TASK-014). Prefer over creating multiple `createClient` instances. */
export function getSharedSupabaseBrowserClient(): SupabaseClient {
  if (!sharedClient) {
    sharedClient = createBrowserSupabaseClient();
  }
  return sharedClient;
}

/** @internal Jest / hot-reload — clears singleton so the next `getSharedSupabaseBrowserClient` builds fresh. */
export function resetSharedSupabaseBrowserClientForTests(): void {
  sharedClient = null;
}
