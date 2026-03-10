"use client";
// Implements: TASK-048

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { useGroups } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { useRepositories } from "@/contexts/RepositoryContext";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { ExpenseForm } from "@/components/ExpenseForm/ExpenseForm";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/components/Toast/Toast";

export default function AddExpenseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get("groupId");
  const { groups } = useGroups();
  const { addExpense } = useExpenses();
  const { currentUser } = useAuth();
  const repos = useRepositories();
  const { showToast } = useToast();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (groupIdParam && groups.some((g) => g.id === groupIdParam)) {
      setSelectedGroupId(groupIdParam);
    }
  }, [groupIdParam, groups]);

  const groupMembers = useLiveQuery(
    async () => {
      if (!selectedGroupId) return [];
      const members = await repos.groups.getMembers(selectedGroupId);
      const users = await Promise.all(
        members.map((m) => repos.users.findById(m.userId))
      );
      return members.map((m, i) => ({
        userId: m.userId,
        name: users[i]?.name ?? "Unknown",
        avatarUrl: users[i]?.avatarUrl,
      }));
    },
    [selectedGroupId, repos.groups, repos.users]
  );

  const handleSubmit = useCallback(
    async (data: {
      title: string;
      date: string;
      amount: number;
      category: string;
      paidBy: Array<{ userId: string; amount: number }>;
      splits: Array<{ userId: string; amountOwed: number }>;
    }) => {
      if (!selectedGroupId || !currentUser) return;
      await addExpense(
        {
          groupId: selectedGroupId,
          title: data.title,
          amount: data.amount,
          date: data.date,
          category: data.category,
          createdBy: currentUser.id,
        },
        data.paidBy.map((p) => ({ userId: p.userId, amount: p.amount })),
        data.splits.map((s) => ({ userId: s.userId, amountOwed: s.amountOwed }))
      );
      showToast("Expense added successfully");
      router.push(ROUTES.GROUP_DETAIL(selectedGroupId));
    },
    [selectedGroupId, currentUser, addExpense, showToast, router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <AppLayout>
      <div className="space-y-6 px-4 py-6" data-testid="add-expense-page">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 hover:bg-surface-muted"
            aria-label="Go back"
          >
            <BackArrowIcon />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
        </div>

        <h1 className="text-2xl font-bold text-text-primary">Add Expense</h1>

        {!selectedGroupId ? (
          <div>
            <label htmlFor="group-select" className="mb-2 block text-sm font-medium">
              Select a group
            </label>
            <select
              id="group-select"
              value=""
              onChange={(e) => setSelectedGroupId(e.target.value || null)}
              className="w-full rounded-lg border border-border px-3 py-2"
            >
              <option value="">Choose a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {groups.length === 0 && (
              <p className="mt-2 text-sm text-text-secondary">
                No groups yet. Create a group first.
              </p>
            )}
          </div>
        ) : (
          <ExpenseForm
            groupMembers={groupMembers ?? []}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </AppLayout>
  );
}

function BackArrowIcon() {
  return (
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
  );
}
