// Implements: TASK-011 (REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError } from "../errors";
import { SupabaseExpenseRepository } from "./ExpenseRepository";

const expenseRow = {
  id: "e1",
  group_id: "g1",
  title: "Dinner",
  amount: 5000,
  date: "2026-03-01",
  category: "food",
  created_by: "u1",
  created_at: "2026-03-01T12:00:00.000Z",
  updated_at: "2026-03-01T12:00:00.000Z",
};

describe("SupabaseExpenseRepository", () => {
  it("getByGroupId orders by date desc then created_at desc", async () => {
    const orderCreated = jest.fn().mockResolvedValue({ data: [expenseRow], error: null });
    const orderDate = jest.fn().mockReturnValue({ order: orderCreated });
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnValue({
          order: orderDate,
        }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseExpenseRepository(client);
    await repo.getByGroupId("g1");

    expect(orderDate).toHaveBeenCalledWith("date", { ascending: false });
    expect(orderCreated).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("create calls create_expense_with_lines RPC and returns loaded expense", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: "e1", error: null });
    const maybeSingle = jest.fn().mockResolvedValue({ data: expenseRow, error: null });
    const client = {
      rpc,
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle,
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseExpenseRepository(client);
    const expense = await repo.create(
      {
        groupId: "g1",
        title: "Dinner",
        amount: 5000,
        date: "2026-03-01",
        category: "food",
        createdBy: "u1",
      },
      [{ userId: "u1", amount: 5000 }],
      [{ userId: "u1", amountOwed: 5000 }],
    );

    expect(rpc).toHaveBeenCalledWith("create_expense_with_lines", {
      p_group_id: "g1",
      p_title: "Dinner",
      p_amount: 5000,
      p_date: "2026-03-01",
      p_category: "food",
      p_payers: [{ user_id: "u1", amount: 5000 }],
      p_splits: [{ user_id: "u1", amount_owed: 5000 }],
    });
    expect(expense.id).toBe("e1");
  });

  it("update with metadata only patches expenses row", async () => {
    const maybeSingleFind = jest.fn().mockResolvedValue({ data: expenseRow, error: null });
    const singleUpdate = jest.fn().mockResolvedValue({
      data: { ...expenseRow, title: "Lunch" },
      error: null,
    });
    let fromCalls = 0;
    const client = {
      from: jest.fn().mockImplementation(() => {
        fromCalls += 1;
        if (fromCalls === 1) {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: maybeSingleFind,
          };
        }
        return {
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({ single: singleUpdate }),
            }),
          }),
        };
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseExpenseRepository(client);
    const updated = await repo.update("e1", { title: "Lunch" });
    expect(updated.title).toBe("Lunch");
    expect(client.from).toHaveBeenCalledWith("expenses");
  });

  it("update throws NotFound when expense missing", async () => {
    const client = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseExpenseRepository(client);
    await expect(repo.update("missing", { title: "x" })).rejects.toThrow(NotFoundError);
  });

  it("update with payers calls update_expense_with_lines and merges existing splits", async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: null });
    const findByIdRow = { ...expenseRow };
    const splitsRows = [{ id: "s1", expense_id: "e1", user_id: "u1", amount_owed: 5000 }];

    const client = {
      rpc,
      from: jest.fn().mockImplementation((table: string) => {
        if (table === "expenses") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: findByIdRow, error: null }),
          };
        }
        if (table === "expense_splits") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: splitsRows, error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    } as unknown as SupabaseClient;

    const repo = new SupabaseExpenseRepository(client);
    await repo.update("e1", {}, [{ userId: "u2", amount: 3000 }]);

    expect(rpc).toHaveBeenCalledWith(
      "update_expense_with_lines",
      expect.objectContaining({
        p_expense_id: "e1",
        p_payers: [{ user_id: "u2", amount: 3000 }],
        p_splits: [{ user_id: "u1", amount_owed: 5000 }],
      }),
    );
  });
});
