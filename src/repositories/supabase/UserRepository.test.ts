// Implements: TASK-009 (REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import { DuplicateError, ValidationError } from "../errors";
import { SupabaseUserRepository } from "./UserRepository";

const profileRow = {
  id: "u1",
  email: "a@b.co",
  display_name: "Alice",
  avatar_url: "",
  created_at: "2026-01-01T00:00:00.000Z",
};

describe("SupabaseUserRepository", () => {
  it("findById maps profile row to User", async () => {
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: profileRow, error: null }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    const user = await repo.findById("u1");
    expect(user).toEqual({
      id: "u1",
      email: "a@b.co",
      name: "Alice",
      avatarUrl: "",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
  });

  it("findById returns undefined when no row", async () => {
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    expect(await repo.findById("missing")).toBeUndefined();
  });

  it("findByEmail maps row", async () => {
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: profileRow, error: null }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    const user = await repo.findByEmail("a@b.co");
    expect(user?.id).toBe("u1");
  });

  it("create throws ValidationError when not signed in", async () => {
    const client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    await expect(
      repo.create({ email: "x@y.co", name: "X", avatarUrl: "" }),
    ).rejects.toThrow(ValidationError);
  });

  it("create inserts profile for auth user id", async () => {
    const single = jest.fn().mockResolvedValue({ data: profileRow, error: null });
    const client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "u1" } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ single }),
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    const user = await repo.create({ email: "a@b.co", name: "Alice", avatarUrl: "" });
    expect(user.id).toBe("u1");
    expect(client.from).toHaveBeenCalledWith("profiles");
  });

  it("maps duplicate constraint to DuplicateError on create", async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });
    const client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "u1" } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ single }),
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    await expect(repo.create({ email: "a@b.co", name: "A", avatarUrl: "" })).rejects.toThrow(DuplicateError);
  });

  it("getAll maps rows", async () => {
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [profileRow], error: null }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseUserRepository(client);
    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Alice");
  });
});
