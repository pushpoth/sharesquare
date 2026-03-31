// Implements: TASK-008 (REQ-024)

import { Group, GroupMember } from "@/types";

export interface IGroupRepository {
  findById(id: string): Promise<Group | undefined>;
  findByInviteCode(code: string): Promise<Group | undefined>;
  getByUserId(userId: string): Promise<Group[]>;
  create(group: Omit<Group, "id" | "createdAt">): Promise<Group>;
  update(id: string, updates: Partial<Group>): Promise<Group>;
  delete(id: string): Promise<void>;
  addMember(groupId: string, userId: string, role: "admin" | "member"): Promise<GroupMember>;
  getMembers(groupId: string): Promise<GroupMember[]>;
  isMember(groupId: string, userId: string): Promise<boolean>;
}
