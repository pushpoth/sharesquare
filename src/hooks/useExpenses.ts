"use client";
// Implements: TASK-025 (REQ-006, REQ-011, REQ-012), TASK-059 (REQ-032)

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types";
import { useRepositories } from "@/contexts/RepositoryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import { logActivity, buildActivityDescription } from "@/services/activityService";

export function useExpenses(groupId?: string) {
  const repos = useRepositories();
  const auth = useAuth();
  const { currencyCode } = useCurrency();

  const expenses = useLiveQuery(async () => {
    if (!groupId) return [];
    return repos.expenses.getByGroupId(groupId);
  }, [groupId, repos.expenses]);

  const addExpense = useCallback(
    async (
      expense: Omit<Expense, "id" | "createdAt" | "updatedAt">,
      payers: Omit<ExpensePayer, "id" | "expenseId">[],
      splits: Omit<ExpenseSplit, "id" | "expenseId">[],
    ) => {
      const created = await repos.expenses.create(expense, payers, splits);
      if (auth.currentUser) {
        await logActivity(repos.activity, {
          userId: auth.currentUser.id,
          groupId: created.groupId,
          type: "expense_added",
          description: buildActivityDescription(
            "expense_added",
            {
              userName: auth.currentUser.name,
              title: created.title,
              amount: created.amount,
              groupName: "",
            },
            currencyCode,
          ),
          referenceId: created.id,
        });
      }
      return created;
    },
    [repos.expenses, repos.activity, auth.currentUser, currencyCode],
  );

  const updateExpense = useCallback(
    async (
      id: string,
      expense: Partial<Expense>,
      payers?: Omit<ExpensePayer, "id" | "expenseId">[],
      splits?: Omit<ExpenseSplit, "id" | "expenseId">[],
    ) => {
      const updated = await repos.expenses.update(id, expense, payers, splits);
      if (auth.currentUser) {
        await logActivity(repos.activity, {
          userId: auth.currentUser.id,
          groupId: updated.groupId,
          type: "expense_edited",
          description: buildActivityDescription("expense_edited", {
            userName: auth.currentUser.name,
            title: updated.title,
            groupName: "",
          }),
          referenceId: updated.id,
        });
      }
      return updated;
    },
    [repos.expenses, repos.activity, auth.currentUser],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const existing = await repos.expenses.findById(id);
      await repos.expenses.delete(id);
      if (auth.currentUser && existing) {
        await logActivity(repos.activity, {
          userId: auth.currentUser.id,
          groupId: existing.groupId,
          type: "expense_deleted",
          description: buildActivityDescription("expense_deleted", {
            userName: auth.currentUser.name,
            title: existing.title,
            groupName: "",
          }),
          referenceId: id,
        });
      }
    },
    [repos.expenses, repos.activity, auth.currentUser],
  );

  return {
    expenses: expenses ?? [],
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
