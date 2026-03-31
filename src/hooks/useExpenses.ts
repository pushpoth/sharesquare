"use client";
// Implements: TASK-025 (REQ-006, REQ-011, REQ-012)

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types";
import { useRepositories } from "@/contexts/RepositoryContext";

export function useExpenses(groupId?: string) {
  const repos = useRepositories();

  const expenses = useLiveQuery(async () => {
    if (!groupId) return [];
    return repos.expenses.getByGroupId(groupId);
  }, [groupId]);

  const addExpense = useCallback(
    async (
      expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
      payers: Omit<ExpensePayer, "id" | "expenseId">[],
      splits: Omit<ExpenseSplit, "id" | "expenseId">[],
    ) => {
      return repos.expenses.create(expense, payers, splits);
    },
    [repos.expenses],
  );

  const updateExpense = useCallback(
    async (
      id: string,
      expense: Partial<Expense>,
      payers?: Omit<ExpensePayer, "id" | "expenseId">[],
      splits?: Omit<ExpenseSplit, "id" | "expenseId">[],
    ) => {
      return repos.expenses.update(id, expense, payers, splits);
    },
    [repos.expenses],
  );

  const deleteExpense = useCallback((id: string) => repos.expenses.delete(id), [repos.expenses]);

  return {
    expenses: expenses ?? [],
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
