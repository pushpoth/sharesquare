// Implements: TASK-014 (REQ-024)

import {
  getSharedSupabaseBrowserClient,
  resetSharedSupabaseBrowserClientForTests,
} from "./client";

describe("getSharedSupabaseBrowserClient", () => {
  beforeEach(() => {
    resetSharedSupabaseBrowserClientForTests();
  });

  afterEach(() => {
    resetSharedSupabaseBrowserClientForTests();
  });

  it("returns the same instance on repeated calls", () => {
    const a = getSharedSupabaseBrowserClient();
    const b = getSharedSupabaseBrowserClient();
    expect(a).toBe(b);
  });
});
