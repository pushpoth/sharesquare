"use client";
// Implements: TASK-024 (REQ-003, REQ-004, REQ-005)

import { useCallback, useEffect, useState } from "react";
import type { Group } from "@/types";
import { DuplicateError } from "@/repositories/errors";
import { useRepositories } from "@/contexts/RepositoryContext";
import { useAuth } from "@/hooks/useAuth";
import { generateUniqueCode, normalizeCode } from "@/services/inviteCodeService";

const MAX_CREATE_ATTEMPTS = 5;

function isRetryableInviteCollision(e: unknown): boolean {
  if (e instanceof DuplicateError) {
    return true;
  }
  if (e instanceof Error && /unique|duplicate|23505/i.test(e.message)) {
    return true;
  }
  return false;
}

export function useGroups() {
  const repos = useRepositories();
  const auth = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!auth.currentUser) {
      setGroups([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await repos.groups.getByUserId(auth.currentUser.id);
      setGroups(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [repos.groups, auth.currentUser]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createGroup = useCallback(
    async (name: string) => {
      if (!auth.currentUser) {
        throw new Error("Must be logged in to create a group");
      }
      let lastError: unknown;
      for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
        try {
          const inviteCode = await generateUniqueCode(repos.groups);
          const created = await repos.groups.create({
            name,
            inviteCode,
            createdBy: auth.currentUser.id,
          });
          await refetch();
          return created;
        } catch (e) {
          lastError = e;
          if (isRetryableInviteCollision(e) && attempt < MAX_CREATE_ATTEMPTS - 1) {
            continue;
          }
          throw e;
        }
      }
      throw lastError instanceof Error ? lastError : new Error("Failed to create group");
    },
    [repos.groups, auth.currentUser, refetch],
  );

  const joinGroup = useCallback(
    async (inviteCode: string) => {
      if (!auth.currentUser) {
        throw new Error("Must be logged in to join a group");
      }
      const code = normalizeCode(inviteCode);
      const group = await repos.groups.findByInviteCode(code);
      if (!group) {
        throw new Error("Invalid invite code");
      }
      const alreadyMember = await repos.groups.isMember(group.id, auth.currentUser.id);
      if (alreadyMember) {
        throw new Error("You are already a member of this group");
      }
      await repos.groups.addMember(group.id, auth.currentUser.id, "member");
      await refetch();
      return group;
    },
    [repos.groups, auth.currentUser, refetch],
  );

  const getGroupById = useCallback((id: string) => repos.groups.findById(id), [repos.groups]);

  const getGroupMembers = useCallback(
    (groupId: string) => repos.groups.getMembers(groupId),
    [repos.groups],
  );

  const updateGroup = useCallback(
    async (id: string, updates: Partial<Pick<Group, "name">>) => {
      const updated = await repos.groups.update(id, updates);
      await refetch();
      return updated;
    },
    [repos.groups, refetch],
  );

  return {
    groups,
    isLoading,
    error,
    refetch,
    createGroup,
    joinGroup,
    getGroupById,
    getGroupMembers,
    updateGroup,
  };
}
