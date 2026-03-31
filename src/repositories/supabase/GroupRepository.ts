// Implements: TASK-010 (REQ-003, REQ-004, REQ-005, REQ-006, REQ-023, REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IGroupRepository } from "../interfaces/IGroupRepository";
import type { Group, GroupMember } from "@/types";
import { DuplicateError, NotFoundError } from "../errors";
import {
  groupMemberRowToMember,
  groupRowToGroup,
  type GroupMemberRow,
  type GroupRow,
} from "./mappers";
import { throwIfError } from "./postgrestError";

export class SupabaseGroupRepository implements IGroupRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Group | undefined> {
    const { data, error } = await this.client.from("groups").select("*").eq("id", id).maybeSingle();
    throwIfError(error);
    if (!data) {
      return undefined;
    }
    return groupRowToGroup(data as GroupRow);
  }

  async findByInviteCode(code: string): Promise<Group | undefined> {
    const { data, error } = await this.client.rpc("find_group_by_invite_code", {
      p_code: code.trim(),
    });
    throwIfError(error);
    const rows = data as GroupRow[] | null;
    if (!rows?.length) {
      return undefined;
    }
    return groupRowToGroup(rows[0]);
  }

  async getByUserId(userId: string): Promise<Group[]> {
    const { data: memberRows, error: mErr } = await this.client
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);
    throwIfError(mErr);
    const ids = (memberRows as { group_id: string }[] | null)?.map((r) => r.group_id) ?? [];
    if (ids.length === 0) {
      return [];
    }
    const { data: groups, error: gErr } = await this.client.from("groups").select("*").in("id", ids);
    throwIfError(gErr);
    return ((groups as GroupRow[] | null) ?? []).map(groupRowToGroup);
  }

  async create(group: Omit<Group, "id" | "createdAt">): Promise<Group> {
    const { data, error } = await this.client.rpc("create_group_with_admin", {
      p_name: group.name,
      p_invite_code: group.inviteCode,
    });
    throwIfError(error);
    if (!data) {
      throw new Error("create_group_with_admin returned no row");
    }
    const row = Array.isArray(data) ? (data[0] as GroupRow) : (data as GroupRow);
    return groupRowToGroup(row);
  }

  async update(id: string, updates: Partial<Group>): Promise<Group> {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) {
      patch.name = updates.name;
    }
    if (updates.inviteCode !== undefined) {
      patch.invite_code = updates.inviteCode;
    }
    if (Object.keys(patch).length === 0) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError(`Group ${id} not found`);
      }
      return existing;
    }
    const { data, error } = await this.client.from("groups").update(patch).eq("id", id).select("*").single();
    throwIfError(error);
    if (!data) {
      throw new Error("Group update returned no row");
    }
    return groupRowToGroup(data as GroupRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("groups").delete().eq("id", id);
    throwIfError(error);
  }

  async addMember(groupId: string, userId: string, role: "admin" | "member"): Promise<GroupMember> {
    const insertRow = { group_id: groupId, user_id: userId, role };
    const { data, error } = await this.client.from("group_members").insert(insertRow).select("*").single();
    if (error?.code === "23505") {
      throw new DuplicateError(`User ${userId} is already a member of group ${groupId}`);
    }
    throwIfError(error);
    if (!data) {
      throw new Error("addMember returned no row");
    }
    return groupMemberRowToMember(data as GroupMemberRow);
  }

  async getMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await this.client
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });
    throwIfError(error);
    return ((data as GroupMemberRow[] | null) ?? []).map(groupMemberRowToMember);
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();
    throwIfError(error);
    return data != null;
  }
}
