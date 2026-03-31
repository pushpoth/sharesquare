// Implements: TASK-004 (REQ-023, REQ-024)

export type GroupMemberRole = "admin" | "member";

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: string;
}
