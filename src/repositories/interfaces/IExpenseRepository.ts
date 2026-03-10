// Implements: TASK-008 (REQ-024)

import { Expense, ExpensePayer, ExpenseSplit } from "@/types";

export interface IExpenseRepository {
  findById(id: string): Promise<Expense | undefined>;
  getByGroupId(groupId: string): Promise<Expense[]>;
  create(
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
    payers: Omit<ExpensePayer, "id" | "expenseId">[],
    splits: Omit<ExpenseSplit, "id" | "expenseId">[]
  ): Promise<Expense>;
  update(
    id: string,
    expense: Partial<Pick<Expense, "title" | "amount" | "date" | "category">>,
    payers?: Omit<ExpensePayer, "id" | "expenseId">[],
    splits?: Omit<ExpenseSplit, "id" | "expenseId">[]
  ): Promise<Expense>;
  delete(id: string): Promise<void>;
  getPayers(expenseId: string): Promise<ExpensePayer[]>;
  getSplits(expenseId: string): Promise<ExpenseSplit[]>;
}
