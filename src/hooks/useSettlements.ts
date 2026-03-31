"use client";
// Implements: TASK-027 (REQ-015)

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Settlement } from "@/types";
import { useRepositories } from "@/contexts/RepositoryContext";

export function useSettlements(groupId?: string) {
  const repos = useRepositories();

  const settlements = useLiveQuery(async () => {
    if (!groupId) return [];
    return repos.settlements.getByGroupId(groupId);
  }, [groupId]);

  const addSettlement = useCallback(
    (settlement: Omit<Settlement, "id" | "createdAt">) => repos.settlements.create(settlement),
    [repos.settlements],
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
