// Implements: TASK-004 (REQ-023, REQ-024)

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // integer cents
  date: string; // ISO 8601 date (YYYY-MM-DD)
  createdAt: string;
}
