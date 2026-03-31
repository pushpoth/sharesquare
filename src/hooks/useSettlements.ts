"use client";
// Implements: TASK-027 (REQ-015)

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Settlement } from "@/types";
import { ValidationError } from "@/repositories/errors";
import { useRepositories } from "@/contexts/RepositoryContext";
import { useAuth } from "@/hooks/useAuth";
import { logActivity, buildActivityDescription } from "@/services/activityService";

export function useSettlements(groupId?: string) {
  const repos = useRepositories();
  const auth = useAuth();

  const settlements = useLiveQuery(async () => {
    if (!groupId) return [];
    return repos.settlements.getByGroupId(groupId);
  }, [groupId, repos.settlements]);

  const addSettlement = useCallback(
    async (settlement: Omit<Settlement, "id" | "createdAt">) => {
      if (!Number.isFinite(settlement.amount) || settlement.amount <= 0) {
        throw new ValidationError("Settlement amount must be greater than zero");
      }
      const created = await repos.settlements.create(settlement);
      if (auth.currentUser) {
        await logActivity(repos.activity, {
          userId: auth.currentUser.id,
          groupId: created.groupId,
          type: "settlement_added",
          description: buildActivityDescription("settlement_added", {
            userName: auth.currentUser.name,
            groupName: "",
          }),
          referenceId: created.id,
        });
      }
      return created;
    },
    [repos.settlements, repos.activity, auth.currentUser],
  );

  const deleteSettlement = useCallback(
    (id: string) => repos.settlements.delete(id),
    [repos.settlements],
  );

  return {
    settlements: settlements ?? [],
    addSettlement,
    deleteSettlement,
  };
}
