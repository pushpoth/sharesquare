// Implements: TASK-008 (REQ-024)
// Payer/split inputs omit `id` and `expenseId`; repository assigns them on insert (design.md §5 shows Omit<expenseId> only — TS needs `id` omitted too for create payloads).

import { Expense, ExpensePayer, ExpenseSplit } from "@/types";

export interface IExpenseRepository {
  findById(id: string): Promise<Expense | undefined>;
  getByGroupId(groupId: string): Promise<Expense[]>;
  create(
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
    payers: Omit<ExpensePayer, "id" | "expenseId">[],
    splits: Omit<ExpenseSplit, "id" | "expenseId">[],
  ): Promise<Expense>;
  update(
    id: string,
    expense: Partial<Expense>,
    payers?: Omit<ExpensePayer, "id" | "expenseId">[],
    splits?: Omit<ExpenseSplit, "id" | "expenseId">[],
  ): Promise<Expense>;
  delete(id: string): Promise<void>;
  getPayers(expenseId: string): Promise<ExpensePayer[]>;
  getSplits(expenseId: string): Promise<ExpenseSplit[]>;
}
