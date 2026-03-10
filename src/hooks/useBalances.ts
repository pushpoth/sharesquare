"use client";
// Implements: TASK-026 (REQ-013, REQ-014)

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/repositories/indexeddb/database";
import {
  calculateGroupBalances,
  calculateOverallBalances,
} from "@/services/balanceService";
import { simplifyDebts } from "@/services/debtSimplificationService";
import { useAuth } from "@/hooks/useAuth";
import { useRepositories } from "@/contexts/RepositoryContext";

export function useBalances(groupId?: string) {
  const auth = useAuth();

  const result = useLiveQuery(
    async () => {
      if (!groupId) return null;
      const [expenses, settlements] = await Promise.all([
        db.expenses.where("groupId").equals(groupId).toArray(),
        db.settlements.where("groupId").equals(groupId).toArray(),
      ]);
      const expenseIds = expenses.map((e) => e.id);
      const [payers, splits] =
        expenseIds.length > 0
          ? await Promise.all([
              db.expensePayers
                .where("expenseId")
                .anyOf(expenseIds)
                .toArray(),
              db.expenseSplits
                .where("expenseId")
                .anyOf(expenseIds)
                .toArray(),
            ])
          : [[], []];

      const memberBalances = calculateGroupBalances(
        expenses,
        payers,
        splits,
        settlements
      );
      const simplifiedDebts = simplifyDebts(memberBalances);

      return {
        memberBalances,
        simplifiedDebts,
      };
    },
    [groupId]
  );

  return {
    memberBalances: result?.memberBalances ?? new Map<string, number>(),
    simplifiedDebts: result?.simplifiedDebts ?? [],
    isLoading: result === undefined,
  };
}

export function useOverallBalances() {
  const auth = useAuth();
  const repos = useRepositories();

  const result = useLiveQuery(
    async () => {
      if (!auth.currentUser) return null;
      const groups = await repos.groups.getByUserId(auth.currentUser.id);
      const balanceMaps: Map<string, number>[] = [];

      for (const group of groups) {
        const [expenses, settlements] = await Promise.all([
          db.expenses.where("groupId").equals(group.id).toArray(),
          db.settlements.where("groupId").equals(group.id).toArray(),
        ]);
        const expenseIds = expenses.map((e) => e.id);
        const [payers, splits] =
          expenseIds.length > 0
            ? await Promise.all([
                db.expensePayers
                  .where("expenseId")
                  .anyOf(expenseIds)
                  .toArray(),
                db.expenseSplits
                  .where("expenseId")
                  .anyOf(expenseIds)
                  .toArray(),
              ])
            : [[], []];

        const memberBalances = calculateGroupBalances(
          expenses,
          payers,
          splits,
          settlements
        );
        balanceMaps.push(memberBalances);
      }

      const { youOwe, owedToYou } = calculateOverallBalances(
        auth.currentUser.id,
        balanceMaps
      );
      const overallBalance = owedToYou - youOwe;

      return { youOwe, owedToYou, overallBalance };
    },
    [auth.currentUser?.id]
  );

  return {
    youOwe: result?.youOwe ?? 0,
    owedToYou: result?.owedToYou ?? 0,
    overallBalance: result?.overallBalance ?? 0,
    isLoading: result === undefined,
  };
}
