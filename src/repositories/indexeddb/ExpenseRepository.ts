// Implements: TASK-011 (REQ-024)

import type { ShareSquareDB } from "./database";
import type { IExpenseRepository } from "../interfaces/IExpenseRepository";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types";
import { generateId } from "@/utils/idGenerator";
import { toISOTimestamp } from "@/utils/dateUtils";
import { NotFoundError } from "../errors";

export class DexieExpenseRepository implements IExpenseRepository {
  constructor(private readonly db: ShareSquareDB) {}

  async findById(id: string): Promise<Expense | undefined> {
    return this.db.expenses.get(id);
  }

  async getByGroupId(groupId: string): Promise<Expense[]> {
    const expenses = await this.db.expenses
      .where("groupId")
      .equals(groupId)
      .sortBy("date");
    return expenses.reverse();
  }

  async create(
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
    payers: Omit<ExpensePayer, "id" | "expenseId">[],
    splits: Omit<ExpenseSplit, "id" | "expenseId">[]
  ): Promise<Expense> {
    const id = generateId();
    const createdAt = toISOTimestamp();
    const updatedAt = createdAt;
    const newExpense: Expense = { ...expense, id, createdAt, updatedAt };

    await this.db.transaction(
      "rw",
      this.db.expenses,
      this.db.expensePayers,
      this.db.expenseSplits,
      async () => {
        await this.db.expenses.put(newExpense);
        for (const p of payers) {
          const payerId = generateId();
          await this.db.expensePayers.put({
            ...p,
            id: payerId,
            expenseId: id,
          });
        }
        for (const s of splits) {
          const splitId = generateId();
          await this.db.expenseSplits.put({
            ...s,
            id: splitId,
            expenseId: id,
          });
        }
      }
    );

    return newExpense;
  }

  async update(
    id: string,
    expense: Partial<Pick<Expense, "title" | "amount" | "date" | "category">>,
    payers?: Omit<ExpensePayer, "id" | "expenseId">[],
    splits?: Omit<ExpenseSplit, "id" | "expenseId">[]
  ): Promise<Expense> {
    await this.db.transaction(
      "rw",
      this.db.expenses,
      this.db.expensePayers,
      this.db.expenseSplits,
      async () => {
        const existing = await this.db.expenses.get(id);
        if (!existing) {
          throw new NotFoundError(`Expense ${id} not found`);
        }
        const updatedAt = toISOTimestamp();
        const updatedExpense: Expense = { ...existing, ...expense, updatedAt };
        await this.db.expenses.put(updatedExpense);

        if (payers !== undefined) {
          await this.db.expensePayers.where("expenseId").equals(id).delete();
          for (const p of payers) {
            const payerId = generateId();
            await this.db.expensePayers.put({
              ...p,
              id: payerId,
              expenseId: id,
            });
          }
        }

        if (splits !== undefined) {
          await this.db.expenseSplits.where("expenseId").equals(id).delete();
          for (const s of splits) {
            const splitId = generateId();
            await this.db.expenseSplits.put({
              ...s,
              id: splitId,
              expenseId: id,
            });
          }
        }
      }
    );

    const updated = await this.db.expenses.get(id);
    if (!updated) {
      throw new NotFoundError(`Expense ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      this.db.expenses,
      this.db.expensePayers,
      this.db.expenseSplits,
      async () => {
        await this.db.expensePayers.where("expenseId").equals(id).delete();
        await this.db.expenseSplits.where("expenseId").equals(id).delete();
        await this.db.expenses.delete(id);
      }
    );
  }

  async getPayers(expenseId: string): Promise<ExpensePayer[]> {
    return this.db.expensePayers
      .where("expenseId")
      .equals(expenseId)
      .toArray();
  }

  async getSplits(expenseId: string): Promise<ExpenseSplit[]> {
    return this.db.expenseSplits
      .where("expenseId")
      .equals(expenseId)
      .toArray();
  }
}
