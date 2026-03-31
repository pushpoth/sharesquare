// Implements: TASK-013 (REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseActivityRepository } from "./ActivityRepository";

const activityRow = {
  id: "a1",
  user_id: "u9",
  group_id: "g1",
  type: "expense_added" as const,
  description: "Dinner",
  reference_id: "e1",
  timestamp: "2026-03-01T12:00:00.000Z",
};

describe("SupabaseActivityRepository", () => {
  it("getByUserId loads group ids then activity with limit", async () => {
    const limit = jest.fn().mockResolvedValue({ data: [activityRow], error: null });
    const order = jest.fn().mockReturnValue({ limit });
    const inFilter = jest.fn().mockReturnValue({ order });
    const secondFrom = {
      select: jest.fn().mockReturnThis(),
      in: inFilter,
    };
    const firstFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ group_id: "g1" }],
        error: null,
      }),
    };

    let call = 0;
    const client = {
      from: jest.fn().mockImplementation(() => {
        call += 1;
        return call === 1 ? firstFrom : secondFrom;
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseActivityRepository(client);
    const entries = await repo.getByUserId("u1", 10);

    expect(inFilter).toHaveBeenCalledWith("group_id", ["g1"]);
    expect(limit).toHaveBeenCalledWith(10);
    expect(entries).toHaveLength(1);
    expect(entries[0].referenceId).toBe("e1");
  });

  it("getByUserId returns [] when user has no groups", async () => {
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseActivityRepository(client);
    expect(await repo.getByUserId("u1")).toEqual([]);
  });

  it("log inserts row and maps response", async () => {
    const single = jest.fn().mockResolvedValue({ data: activityRow, error: null });
    const client = {
      from: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({ single }),
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseActivityRepository(client);
    const entry = await repo.log({
      userId: "u9",
      groupId: "g1",
      type: "expense_added",
      description: "Dinner",
      referenceId: "e1",
    });

    expect(entry.id).toBe("a1");
    expect(client.from).toHaveBeenCalledWith("activity_entries");
  });
});
