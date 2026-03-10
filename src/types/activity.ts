// Implements: TASK-004 (REQ-023, REQ-024)

export type ActivityType =
  | "expense_added"
  | "expense_edited"
  | "expense_deleted"
  | "settlement_added"
  | "member_joined"
  | "group_created";

export interface ActivityEntry {
  id: string;
  userId: string;
  groupId: string;
  type: ActivityType;
  description: string;
  referenceId: string;
  timestamp: string;
}
