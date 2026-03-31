// Implements: TASK-011 (REQ-006, REQ-011, REQ-012, REQ-023, REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IExpenseRepository } from "../interfaces/IExpenseRepository";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types";
import { NotFoundError } from "../errors";
import {
  expensePayerRowToPayer,
  expenseRowToExpense,
  expenseSplitRowToSplit,
  type ExpensePayerRow,
  type ExpenseRow,
  type ExpenseSplitRow,
} from "./mappers";
import { throwIfError } from "./postgrestError";

function payersToJson(payers: Omit<ExpensePayer, "id" | "expenseId">[]) {
  return payers.map((p) => ({ user_id: p.userId, amount: p.amount }));
}

function splitsToJson(splits: Omit<ExpenseSplit, "id" | "expenseId">[]) {
  return splits.map((s) => ({ user_id: s.userId, amount_owed: s.amountOwed }));
}

export class SupabaseExpenseRepository implements IExpenseRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Expense | undefined> {
    const { data, error } = await this.client.from("expenses").select("*").eq("id", id).maybeSingle();
    throwIfError(error);
    if (!data) {
      return undefined;
    }
    return expenseRowToExpense(data as ExpenseRow);
  }

  async getByGroupId(groupId: string): Promise<Expense[]> {
    const { data, error } = await this.client
      .from("expenses")
      .select("*")
      .eq("group_id", groupId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    throwIfError(error);
    return ((data as ExpenseRow[] | null) ?? []).map(expenseRowToExpense);
  }

  async create(
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
    payers: Omit<ExpensePayer, "id" | "expenseId">[],
    splits: Omit<ExpenseSplit, "id" | "expenseId">[],
  ): Promise<Expense> {
    const { data: expenseId, error } = await this.client.rpc("create_expense_with_lines", {
      p_group_id: expense.groupId,
      p_title: expense.title,
      p_amount: expense.amount,
      p_date: expense.date,
      p_category: expense.category,
      p_payers: payersToJson(payers),
      p_splits: splitsToJson(splits),
    });
    throwIfError(error);
    if (!expenseId || typeof expenseId !== "string") {
      throw new Error("create_expense_with_lines returned invalid id");
    }
    const created = await this.findById(expenseId);
    if (!created) {
      throw new Error("Expense not found after create");
    }
    return created;
  }

  async update(
    id: string,
    expense: Partial<Expense>,
    payers?: Omit<ExpensePayer, "id" | "expenseId">[],
    splits?: Omit<ExpenseSplit, "id" | "expenseId">[],
  ): Promise<Expense> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Expense ${id} not found`);
    }

    if (payers === undefined && splits === undefined) {
      const patch: Record<string, unknown> = {};
      if (expense.title !== undefined) {
        patch.title = expense.title;
      }
      if (expense.amount !== undefined) {
        patch.amount = expense.amount;
      }
      if (expense.date !== undefined) {
        patch.date = expense.date;
      }
      if (expense.category !== undefined) {
        patch.category = expense.category;
      }
      if (expense.groupId !== undefined) {
        patch.group_id = expense.groupId;
      }
      if (Object.keys(patch).length === 0) {
        return existing;
      }
      const { data, error } = await this.client.from("expenses").update(patch).eq("id", id).select("*").single();
      throwIfError(error);
      if (!data) {
        throw new NotFoundError(`Expense ${id} not found after update`);
      }
      return expenseRowToExpense(data as ExpenseRow);
    }

    const merged: Expense = { ...existing, ...expense, updatedAt: existing.updatedAt };
    const nextPayers = payers ?? (await this.getPayers(id)).map((p) => ({ userId: p.userId, amount: p.amount }));
    const nextSplits =
      splits ??
      (await this.getSplits(id)).map((s) => ({ userId: s.userId, amountOwed: s.amountOwed }));

    const { error: rpcErr } = await this.client.rpc("update_expense_with_lines", {
      p_expense_id: id,
      p_title: merged.title,
      p_amount: merged.amount,
      p_date: merged.date,
      p_category: merged.category,
      p_payers: payersToJson(nextPayers),
      p_splits: splitsToJson(nextSplits),
    });
    throwIfError(rpcErr);

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundError(`Expense ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("expenses").delete().eq("id", id);
    throwIfError(error);
  }

  async getPayers(expenseId: string): Promise<ExpensePayer[]> {
    const { data, error } = await this.client.from("expense_payers").select("*").eq("expense_id", expenseId);
    throwIfError(error);
    return ((data as ExpensePayerRow[] | null) ?? []).map(expensePayerRowToPayer);
  }

  async getSplits(expenseId: string): Promise<ExpenseSplit[]> {
    const { data, error } = await this.client.from("expense_splits").select("*").eq("expense_id", expenseId);
    throwIfError(error);
    return ((data as ExpenseSplitRow[] | null) ?? []).map(expenseSplitRowToSplit);
  }
}
