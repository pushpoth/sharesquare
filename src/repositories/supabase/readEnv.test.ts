// Implements: TASK-014 (REQ-024)

import { isSupabaseAuthConfigured, isSupabaseRepositoriesEnabled, readPublicEnv } from "./readEnv";

describe("readPublicEnv", () => {
  it("reads from process.env in Jest", () => {
    expect(readPublicEnv("VITE_SUPABASE_URL")).toBeTruthy();
  });
});

describe("isSupabaseRepositoriesEnabled", () => {
  const key = "VITE_USE_SUPABASE_REPOS";
  const prev = process.env[key];

  afterEach(() => {
    if (prev === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = prev;
    }
  });

  it("is false when unset", () => {
    delete process.env[key];
    expect(isSupabaseRepositoriesEnabled()).toBe(false);
  });

  it("is true only for exact true string", () => {
    process.env[key] = "true";
    expect(isSupabaseRepositoriesEnabled()).toBe(true);
    process.env[key] = "yes";
    expect(isSupabaseRepositoriesEnabled()).toBe(false);
  });
});

describe("isSupabaseAuthConfigured", () => {
  const urlKey = "VITE_SUPABASE_URL";
  const keyKey = "VITE_SUPABASE_ANON_KEY";
  const prevUrl = process.env[urlKey];
  const prevKey = process.env[keyKey];

  afterEach(() => {
    process.env[urlKey] = prevUrl;
    process.env[keyKey] = prevKey;
  });

  it("is false for Jest default test.supabase.co URL", () => {
    process.env[urlKey] = "https://test.supabase.co";
    process.env[keyKey] = "test-anon-key";
    expect(isSupabaseAuthConfigured()).toBe(false);
  });

  it("is true for non-placeholder URL with key", () => {
    process.env[urlKey] = "https://abc123.supabase.co";
    process.env[keyKey] = "real-anon-key";
    expect(isSupabaseAuthConfigured()).toBe(true);
  });
});
