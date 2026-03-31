"use client";
// Implements: TASK-024 (REQ-003, REQ-004, REQ-005)

import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Group } from "@/types";
import { useRepositories } from "@/contexts/RepositoryContext";
import { useAuth } from "@/hooks/useAuth";
import { generateUniqueCode, normalizeCode } from "@/services/inviteCodeService";

export function useGroups() {
  const repos = useRepositories();
  const auth = useAuth();

  const groups = useLiveQuery(async () => {
    if (!auth.currentUser) return [];
    return repos.groups.getByUserId(auth.currentUser.id);
  }, [auth.currentUser?.id]);

  const createGroup = useCallback(
    async (name: string) => {
      if (!auth.currentUser) {
        throw new Error("Must be logged in to create a group");
      }
      const inviteCode = await generateUniqueCode(repos.groups);
      return repos.groups.create({
        name,
        inviteCode,
        createdBy: auth.currentUser.id,
      });
    },
    [repos.groups, auth.currentUser],
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
      return group;
    },
    [repos.groups, auth.currentUser],
  );

  const getGroupById = useCallback((id: string) => repos.groups.findById(id), [repos.groups]);

  const getGroupMembers = useCallback(
    (groupId: string) => repos.groups.getMembers(groupId),
    [repos.groups],
  );

  const updateGroup = useCallback(
    (id: string, updates: Partial<Pick<Group, "name">>) => repos.groups.update(id, updates),
    [repos.groups],
  );

  return {
    groups: groups ?? [],
    createGroup,
    joinGroup,
    getGroupById,
    getGroupMembers,
    updateGroup,
  };
}
