"use client";
// Implements: TASK-049

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useExpenses } from "@/hooks/useExpenses";
import { useRepositories } from "@/contexts/RepositoryContext";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { ExpenseForm } from "@/components/ExpenseForm/ExpenseForm";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/components/Toast/Toast";

const GROUP_PAYER_ID = "__group__";

export default function EditExpenseClient() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  const repos = useRepositories();
  const { showToast } = useToast();

  const expenseData = useLiveQuery(
    async () => {
      const exp = await repos.expenses.findById(expenseId);
      if (!exp) return null;
      const [p, s] = await Promise.all([
        repos.expenses.getPayers(expenseId),
        repos.expenses.getSplits(expenseId),
      ]);
      return { expense: exp, payers: p, splits: s };
    },
    [expenseId, repos.expenses],
  );

  const expense = expenseData?.expense;
  const payers = expenseData?.payers ?? [];
  const splits = expenseData?.splits ?? [];
  const groupId = expense?.groupId;
  const { updateExpense } = useExpenses(groupId ?? undefined);

  const groupMembers = useLiveQuery(
    async () => {
      if (!groupId) return [];
      const members = await repos.groups.getMembers(groupId);
      const users = await Promise.all(members.map((m) => repos.users.findById(m.userId)));
      return members.map((m, i) => ({
        userId: m.userId,
        name: users[i]?.name ?? "Unknown",
        avatarUrl: users[i]?.avatarUrl,
      }));
    },
    [groupId, repos.groups, repos.users],
  );

  const initialData = expense
    ? (() => {
        const payerId =
          payers.length === 0
            ? GROUP_PAYER_ID
            : payers.length === 1
              ? payers[0].userId
              : GROUP_PAYER_ID;
        const splitsData = splits.map((s) => ({
          userId: s.userId,
          amountOwed: s.amountOwed,
        }));
        return {
          title: expense.title,
          date: expense.date,
          amount: expense.amount,
          category: expense.category,
          payerId,
          splits: splitsData,
        };
      })()
    : undefined;

  const handleSubmit = useCallback(
    async (data: {
      title: string;
      date: string;
      amount: number;
      category: string;
      paidBy: Array<{ userId: string; amount: number }>;
      splits: Array<{ userId: string; amountOwed: number }>;
    }) => {
      await updateExpense(
        expenseId,
        { title: data.title, amount: data.amount, date: data.date, category: data.category },
        data.paidBy.map((p) => ({ userId: p.userId, amount: p.amount })),
        data.splits.map((s) => ({ userId: s.userId, amountOwed: s.amountOwed })),
      );
      showToast("Expense updated successfully");
      if (groupId) {
        router.push(ROUTES.GROUP_DETAIL(groupId));
      } else {
        router.back();
      }
    },
    [expenseId, groupId, updateExpense, showToast, router],
  );

  const handleCancel = useCallback(() => {
    if (groupId) {
      router.push(ROUTES.GROUP_DETAIL(groupId));
    } else {
      router.back();
    }
  }, [groupId, router]);

  if (!expense) {
    return (
      <AppLayout>
        <div
          className="flex min-h-[200px] items-center justify-center"
          data-testid="edit-expense-page"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 px-4 py-6" data-testid="edit-expense-page">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 hover:bg-surface-muted"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
        </div>

        <h1 className="text-2xl font-bold text-text-primary">Edit Expense</h1>

        <ExpenseForm
          groupMembers={groupMembers ?? []}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
}
