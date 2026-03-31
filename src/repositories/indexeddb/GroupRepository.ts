// Implements: TASK-010 (REQ-024)

import type { ShareSquareDB } from "./database";
import type { IGroupRepository } from "../interfaces/IGroupRepository";
import type { Group, GroupMember } from "@/types";
import { generateId } from "@/utils/idGenerator";
import { toISOTimestamp } from "@/utils/dateUtils";
import { NotFoundError, DuplicateError } from "../errors";

export class DexieGroupRepository implements IGroupRepository {
  constructor(private readonly db: ShareSquareDB) {}

  async findById(id: string): Promise<Group | undefined> {
    return this.db.groups.get(id);
  }

  async findByInviteCode(code: string): Promise<Group | undefined> {
    const normalized = code.toUpperCase();
    return this.db.groups.where("inviteCode").equals(normalized).first();
  }

  async getByUserId(userId: string): Promise<Group[]> {
    const memberships = await this.db.groupMembers.where("userId").equals(userId).toArray();
    const groupIds = memberships.map((m) => m.groupId);
    const groups = await this.db.groups.where("id").anyOf(groupIds).toArray();
    return groups;
  }

  async create(group: Omit<Group, "id" | "createdAt">): Promise<Group> {
    const id = generateId();
    const createdAt = toISOTimestamp();
    const newGroup: Group = { ...group, id, createdAt };

    await this.db.transaction("rw", this.db.groups, this.db.groupMembers, async () => {
      await this.db.groups.put(newGroup);
      const memberId = generateId();
      const joinedAt = toISOTimestamp();
      const creatorMember: GroupMember = {
        id: memberId,
        groupId: id,
        userId: group.createdBy,
        role: "admin",
        joinedAt,
      };
      await this.db.groupMembers.put(creatorMember);
    });

    return newGroup;
  }

  async update(id: string, updates: Partial<Group>): Promise<Group> {
    const group = await this.db.groups.get(id);
    if (!group) {
      throw new NotFoundError(`Group ${id} not found`);
    }
    const updated: Group = { ...group, ...updates };
    await this.db.groups.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.transaction("rw", this.db.groups, this.db.groupMembers, async () => {
      await this.db.groupMembers.where("groupId").equals(id).delete();
      await this.db.groups.delete(id);
    });
  }

  async addMember(groupId: string, userId: string, role: "admin" | "member"): Promise<GroupMember> {
    const alreadyMember = await this.isMember(groupId, userId);
    if (alreadyMember) {
      throw new DuplicateError(`User ${userId} is already a member of group ${groupId}`);
    }
    const memberId = generateId();
    const joinedAt = toISOTimestamp();
    const member: GroupMember = {
      id: memberId,
      groupId,
      userId,
      role,
      joinedAt,
    };
    await this.db.groupMembers.put(member);
    return member;
  }

  async getMembers(groupId: string): Promise<GroupMember[]> {
    return this.db.groupMembers.where("groupId").equals(groupId).toArray();
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await this.db.groupMembers
      .where("[groupId+userId]")
      .equals([groupId, userId])
      .first();
    return member !== undefined;
  }
}
