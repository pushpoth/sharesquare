"use client";
// Implements: TASK-047 (REQ-016, REQ-012, REQ-015, REQ-017, REQ-030), TASK-053 (REQ-018), TASK-058 (REQ-031), TASK-057 (REQ-030), TASK-060 (REQ-033)

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useGroups } from "@/hooks/useGroups";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalances } from "@/hooks/useBalances";
import { useSettlements } from "@/hooks/useSettlements";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRepositories } from "@/contexts/RepositoryContext";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { MemberBalanceList } from "@/components/MemberBalanceList/MemberBalanceList";
import { SettlementForm } from "@/components/SettlementForm/SettlementForm";
import { ExpenseFilters } from "@/components/ExpenseFilters/ExpenseFilters";
import { ExpenseList } from "@/components/ExpenseList/ExpenseList";
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { useToast } from "@/components/Toast/Toast";
import { ROUTES } from "@/constants/routes";
import { formatCurrency } from "@/utils/currency";
import { CATEGORY_MAP, EXPENSE_CATEGORIES } from "@/constants/categories";
import { CategoryChart } from "@/components/CategoryChart/CategoryChart";
import { FlowDiagram } from "@/components/FlowDiagram/FlowDiagram";
import type { ExpenseFiltersState } from "@/components/ExpenseFilters/ExpenseFilters";
import type { ExpensePayer, ExpenseSplit } from "@/types";

export default function GroupDetailClient() {
  const navigate = useNavigate();
  const params = useParams();
  const groupId = params.id as string;
  const { getGroupById, updateGroup, getGroupMembers, deleteGroup } = useGroups();
  const { showToast } = useToast();
  const { expenses, deleteExpense } = useExpenses(groupId);
  const { memberBalances, simplifiedDebts } = useBalances(groupId);
  const { addSettlement } = useSettlements(groupId);
  const { currentUser } = useAuth();
  const { currencyCode } = useCurrency();
  const repos = useRepositories();

  const [group, setGroup] = useState<Awaited<ReturnType<typeof getGroupById>>>(undefined);
  const [showSettlement, setShowSettlement] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFiltersState>({
    categories: [],
    sort: "date-desc",
  });
  const [payersMap, setPayersMap] = useState<Map<string, ExpensePayer[]>>(new Map());
  const [splitsMap, setSplitsMap] = useState<Map<string, ExpenseSplit[]>>(new Map());
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const inviteCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getGroupById(groupId).then(setGroup);
  }, [groupId, getGroupById]);

  const groupMembers = useLiveQuery(async () => {
    if (!groupId) return [];
    return getGroupMembers(groupId);
  }, [groupId, getGroupMembers]);

  const membersWithUsers = useLiveQuery(async () => {
    if (!groupMembers) return new Map<string, { name: string }>();
    const users = await Promise.all(groupMembers.map((m) => repos.users.findById(m.userId)));
    const map = new Map<string, { name: string }>();
    groupMembers.forEach((m, i) => {
      map.set(m.userId, { name: users[i]?.name ?? "Unknown" });
    });
    return map;
  }, [groupMembers, repos.users]);

  const effectiveMembersMap = useMemo(
    () => membersWithUsers ?? new Map<string, { name: string }>(),
    [membersWithUsers],
  );

  useEffect(() => {
    if (!expenses.length) {
      setPayersMap(new Map());
      setSplitsMap(new Map());
      return;
    }
    const loadPayersAndSplits = async () => {
      const [payersArrays, splitsArrays] = await Promise.all([
        Promise.all(expenses.map((e) => repos.expenses.getPayers(e.id))),
        Promise.all(expenses.map((e) => repos.expenses.getSplits(e.id))),
      ]);
      const pMap = new Map<string, ExpensePayer[]>();
      const sMap = new Map<string, ExpenseSplit[]>();
      expenses.forEach((e, i) => {
        pMap.set(e.id, payersArrays[i] ?? []);
        sMap.set(e.id, splitsArrays[i] ?? []);
      });
      setPayersMap(pMap);
      setSplitsMap(sMap);
    };
    loadPayersAndSplits();
  }, [expenses, repos.expenses]);

  const memberBalanceList = useMemo(() => {
    if (!groupMembers) return [];
    return groupMembers.map((m) => ({
      userId: m.userId,
      name: effectiveMembersMap.get(m.userId)?.name ?? "Unknown",
      avatarUrl: undefined,
      balance: memberBalances.get(m.userId) ?? 0,
    }));
  }, [groupMembers, effectiveMembersMap, memberBalances]);

  const filteredExpenses = useMemo(() => {
    let list = [...expenses];
    if (filters.categories.length > 0) {
      list = list.filter((e) => filters.categories.includes(e.category));
    }
    switch (filters.sort) {
      case "date-asc":
        list.sort((a, b) => a.date.localeCompare(b.date));
        break;
      case "date-desc":
        list.sort((a, b) => b.date.localeCompare(a.date));
        break;
      case "amount-asc":
        list.sort((a, b) => a.amount - b.amount);
        break;
      case "amount-desc":
        list.sort((a, b) => b.amount - a.amount);
        break;
    }
    return list;
  }, [expenses, filters]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const isAdmin = group?.createdBy === currentUser?.id;
  const isGroupAdmin =
    groupMembers?.some((m) => m.userId === currentUser?.id && m.role === "admin") ?? false;

  const categoryChartSegments = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses) {
      m.set(e.category, (m.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(m.entries()).map(([categoryKey, amountCents]) => ({
      categoryKey,
      label: CATEGORY_MAP[categoryKey]?.label ?? categoryKey,
      amountCents,
    }));
  }, [expenses]);

  const debtFlows = useMemo(
    () =>
      simplifiedDebts.map((d) => ({
        fromUserId: d.from,
        toUserId: d.to,
        amountCents: d.amount,
      })),
    [simplifiedDebts],
  );

  const resolveMemberName = useCallback(
    (userId: string) => effectiveMembersMap.get(userId)?.name ?? userId,
    [effectiveMembersMap],
  );

  const handleNameSave = useCallback(
    async (newName: string) => {
      if (!groupId || !isAdmin || !newName.trim()) return;
      await updateGroup(groupId, { name: newName.trim() });
      setGroup((g) => (g ? { ...g, name: newName.trim() } : g));
      setEditingName(false);
    },
    [groupId, isAdmin, updateGroup],
  );

  const startEditingName = () => {
    if (isAdmin) {
      setEditNameValue(group?.name ?? "");
      setEditingName(true);
    }
  };

  const handleSettlementSubmit = useCallback(
    async (data: { fromUserId: string; toUserId: string; amount: number; date: string }) => {
      await addSettlement({
        groupId,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        amount: data.amount,
        date: data.date,
      });
      setShowSettlement(false);
    },
    [groupId, addSettlement],
  );

  const handleDeleteExpense = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteExpense(deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget, deleteExpense]);

  const handleCopyInviteCode = useCallback(() => {
    if (!group) return;
    void navigator.clipboard.writeText(group.inviteCode).then(() => {
      showToast("Invite code copied", "success");
      setInviteCopied(true);
      if (inviteCopyTimeoutRef.current) clearTimeout(inviteCopyTimeoutRef.current);
      inviteCopyTimeoutRef.current = setTimeout(() => setInviteCopied(false), 2000);
    });
  }, [group, showToast]);

  useEffect(() => {
    return () => {
      if (inviteCopyTimeoutRef.current) clearTimeout(inviteCopyTimeoutRef.current);
    };
  }, []);

  const handleConfirmDeleteGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      await deleteGroup(groupId);
      showToast("Group deleted", "success");
      setConfirmDeleteGroup(false);
      navigate(ROUTES.GROUPS);
    } catch {
      showToast("Could not delete group", "error");
      setConfirmDeleteGroup(false);
    }
  }, [groupId, deleteGroup, showToast, navigate]);

  const settlementMembers = useMemo(
    () =>
      groupMembers?.map((m) => ({
        userId: m.userId,
        name: effectiveMembersMap.get(m.userId)?.name ?? "Unknown",
      })) ?? [],
    [groupMembers, effectiveMembersMap],
  );

  if (!group) {
    return (
      <AppLayout>
        <div
          className="flex min-h-[200px] items-center justify-center"
          data-testid="group-detail-page"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 px-4 py-6" data-testid="group-detail-page">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 hover:bg-surface-muted"
            aria-label="Go back"
          >
            <BackArrowIcon />
          </button>
          {editingName ? (
            <input
              type="text"
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onBlur={() => handleNameSave(editNameValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSave(editNameValue);
                if (e.key === "Escape") setEditingName(false);
              }}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-xl font-bold"
              autoFocus
            />
          ) : (
            <h1
              className={`flex-1 text-xl font-bold text-text-primary ${isAdmin ? "cursor-pointer hover:underline" : ""}`}
              onClick={startEditingName}
              role={isAdmin ? "button" : undefined}
            >
              {group.name}
            </h1>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-sm text-text-secondary">Group Total Expenses</p>
          <p className="text-2xl font-bold text-text-primary">
            {formatCurrency(totalExpenses, currencyCode)}
          </p>
        </div>

        <section aria-labelledby="group-invite-heading">
          <h2 id="group-invite-heading" className="mb-2 text-lg font-semibold text-text-primary">
            Invite members
          </h2>
          <p className="mb-3 text-sm text-text-secondary">
            Share this code so others can join this group from the Groups tab.
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-muted/50 p-3">
            <code
              className="flex-1 min-w-[8rem] font-mono text-lg font-medium text-text-primary"
              data-testid="group-invite-code"
            >
              {group.inviteCode}
            </code>
            <button
              type="button"
              data-testid="group-invite-copy"
              onClick={handleCopyInviteCode}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              {inviteCopied ? "Copied!" : "Copy code"}
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Member Balances</h2>
          <MemberBalanceList members={memberBalanceList} />
        </section>

        <section aria-labelledby="group-insights-heading">
          <h2 id="group-insights-heading" className="mb-3 text-lg font-semibold text-text-primary">
            Insights
          </h2>
          <div className="space-y-6 rounded-xl border border-border bg-white p-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Spending by category</h3>
              <CategoryChart segments={categoryChartSegments} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-secondary">Simplified settlements</h3>
              <FlowDiagram flows={debtFlows} resolveName={resolveMemberName} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              data-testid="group-add-expense"
              onClick={() =>
                navigate(`${ROUTES.ADD_EXPENSE}?groupId=${encodeURIComponent(groupId)}`)
              }
              className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-muted"
            >
              Add expense
            </button>
            <button
              type="button"
              onClick={() => setShowSettlement(true)}
              className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              Record Settlement
            </button>
          </div>
          {showSettlement && (
            <div className="mt-4 rounded-xl border border-border bg-white p-4">
              <SettlementForm
                members={settlementMembers}
                onSubmit={handleSettlementSubmit}
                onCancel={() => setShowSettlement(false)}
              />
            </div>
          )}
        </section>

        {isGroupAdmin ? (
          <section aria-labelledby="group-danger-heading">
            <h2 id="group-danger-heading" className="mb-2 text-lg font-semibold text-owing-text">
              Danger zone
            </h2>
            <p className="mb-3 text-sm text-text-secondary">
              Permanently delete this group, all expenses, settlements, and activity for this group.
            </p>
            <button
              type="button"
              data-testid="group-delete-open"
              onClick={() => setConfirmDeleteGroup(true)}
              className="w-full rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete group
            </button>
          </section>
        ) : null}

        <section>
          <ExpenseFilters
            onFilterChange={setFilters}
            categories={EXPENSE_CATEGORIES.map((c) => c.value)}
          />
          <div className="mt-3">
            <ExpenseList
              expenses={filteredExpenses}
              payers={payersMap}
              splits={splitsMap}
              members={effectiveMembersMap}
              currentUserId={currentUser?.id ?? ""}
              onEdit={(id) => navigate(ROUTES.EDIT_EXPENSE(id))}
              onDelete={(id) => setDeleteTarget(id)}
            />
          </div>
        </section>

        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteExpense}
          onCancel={() => setDeleteTarget(null)}
        />

        <ConfirmDialog
          isOpen={confirmDeleteGroup}
          title="Delete group"
          message="This removes the group and all related expenses and settlements for every member. This cannot be undone."
          confirmLabel="Delete group"
          variant="destructive"
          onConfirm={() => void handleConfirmDeleteGroup()}
          onCancel={() => setConfirmDeleteGroup(false)}
        />
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
