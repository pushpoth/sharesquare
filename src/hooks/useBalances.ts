"use client";
// Implements: TASK-026 (REQ-013, REQ-014)

import { useLiveQuery } from "dexie-react-hooks";
import {
  type RepositoryContextValue,
  useRepositories,
} from "@/contexts/RepositoryContext";
import { calculateGroupBalances, calculateOverallBalances } from "@/services/balanceService";
import { simplifyDebts } from "@/services/debtSimplificationService";
import { useAuth } from "@/hooks/useAuth";

async function loadGroupLedger(repos: RepositoryContextValue, groupId: string) {
  const [expenses, settlements] = await Promise.all([
    repos.expenses.getByGroupId(groupId),
    repos.settlements.getByGroupId(groupId),
  ]);
  const expenseIds = expenses.map((e) => e.id);
  const [payers, splits] =
    expenseIds.length > 0
      ? await Promise.all([
          Promise.all(expenseIds.map((id) => repos.expenses.getPayers(id))).then((rows) =>
            rows.flat(),
          ),
          Promise.all(expenseIds.map((id) => repos.expenses.getSplits(id))).then((rows) =>
            rows.flat(),
          ),
        ])
      : [[], []];

  const memberBalances = calculateGroupBalances(expenses, payers, splits, settlements);
  const simplifiedDebts = simplifyDebts(memberBalances);

  return {
    memberBalances,
    simplifiedDebts,
  };
}

export function useBalances(groupId?: string) {
  const repos = useRepositories();

  const result = useLiveQuery(async () => {
    if (!groupId) return null;
    return loadGroupLedger(repos, groupId);
  }, [groupId, repos]);

  return {
    memberBalances: result?.memberBalances ?? new Map<string, number>(),
    simplifiedDebts: result?.simplifiedDebts ?? [],
    isLoading: result === undefined,
  };
}

export function useOverallBalances() {
  const auth = useAuth();
  const repos = useRepositories();

  const result = useLiveQuery(async () => {
    if (!auth.currentUser) return null;
    const groups = await repos.groups.getByUserId(auth.currentUser.id);
    const balanceMaps: Map<string, number>[] = [];

    for (const group of groups) {
      const { memberBalances } = await loadGroupLedger(repos, group.id);
      balanceMaps.push(memberBalances);
    }

    const { youOwe, owedToYou } = calculateOverallBalances(auth.currentUser.id, balanceMaps);
    const overallBalance = owedToYou - youOwe;

    return { youOwe, owedToYou, overallBalance };
  }, [auth.currentUser?.id, repos]);

  return {
    youOwe: result?.youOwe ?? 0,
    owedToYou: result?.owedToYou ?? 0,
    overallBalance: result?.overallBalance ?? 0,
    isLoading: result === undefined,
  };
}
