// Implements: TASK-012 (REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseSettlementRepository } from "./SettlementRepository";

const settlementRow = {
  id: "s1",
  group_id: "g1",
  from_user_id: "u1",
  to_user_id: "u2",
  amount: 1000,
  date: "2026-03-01",
  created_at: "2026-03-01T12:00:00.000Z",
};

describe("SupabaseSettlementRepository", () => {
  it("getByGroupId orders by date desc then created_at desc", async () => {
    const orderCreated = jest.fn().mockResolvedValue({ data: [settlementRow], error: null });
    const orderDate = jest.fn().mockReturnValue({ order: orderCreated });
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({
          order: orderDate,
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseSettlementRepository(client);
    await repo.getByGroupId("g1");

    expect(orderDate).toHaveBeenCalledWith("date", { ascending: false });
    expect(orderCreated).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("create inserts snake_case columns", async () => {
    const single = jest.fn().mockResolvedValue({ data: settlementRow, error: null });
    const insert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ single }),
    });
    const client = {
      from: jest.fn().mockReturnValue({ insert }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseSettlementRepository(client);
    await repo.create({
      groupId: "g1",
      fromUserId: "u1",
      toUserId: "u2",
      amount: 1000,
      date: "2026-03-01",
    });

    expect(insert).toHaveBeenCalledWith({
      group_id: "g1",
      from_user_id: "u1",
      to_user_id: "u2",
      amount: 1000,
      date: "2026-03-01",
    });
  });

  it("delete removes by id", async () => {
    const eq = jest.fn().mockResolvedValue({ error: null });
    const client = {
      from: jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnValue({ eq }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseSettlementRepository(client);
    await repo.delete("s1");
    expect(client.from).toHaveBeenCalledWith("settlements");
    expect(eq).toHaveBeenCalledWith("id", "s1");
  });
});
