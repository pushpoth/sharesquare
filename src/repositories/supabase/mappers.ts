// Implements: TASK-009 (REQ-024)

import type {
  ActivityEntry,
  ActivityType,
  Expense,
  ExpensePayer,
  ExpenseSplit,
  Group,
  GroupMember,
  Settlement,
  User,
} from "@/types";

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type GroupRow = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type GroupMemberRow = {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
};

export type ExpenseRow = {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ExpensePayerRow = {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
};

export type ExpenseSplitRow = {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
};

export function profileRowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email ?? "",
    name: row.display_name ?? "",
    avatarUrl: row.avatar_url ?? "",
    createdAt: row.created_at,
  };
}

export function groupRowToGroup(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function groupMemberRowToMember(row: GroupMemberRow): GroupMember {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

export function expenseRowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    amount: Number(row.amount),
    date: row.date,
    category: row.category,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function expensePayerRowToPayer(row: ExpensePayerRow): ExpensePayer {
  return {
    id: row.id,
    expenseId: row.expense_id,
    userId: row.user_id,
    amount: Number(row.amount),
  };
}

export function expenseSplitRowToSplit(row: ExpenseSplitRow): ExpenseSplit {
  return {
    id: row.id,
    expenseId: row.expense_id,
    userId: row.user_id,
    amountOwed: Number(row.amount_owed),
  };
}

export type SettlementRow = {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  date: string;
  created_at: string;
};

export type ActivityEntryRow = {
  id: string;
  user_id: string;
  group_id: string;
  type: ActivityType;
  description: string;
  reference_id: string;
  timestamp: string;
};

export function settlementRowToSettlement(row: SettlementRow): Settlement {
  return {
    id: row.id,
    groupId: row.group_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    amount: Number(row.amount),
    date: row.date,
    createdAt: row.created_at,
  };
}

export function activityRowToEntry(row: ActivityEntryRow): ActivityEntry {
  return {
    id: row.id,
    userId: row.user_id,
    groupId: row.group_id,
    type: row.type,
    description: row.description,
    referenceId: row.reference_id,
    timestamp: row.timestamp,
  };
}
