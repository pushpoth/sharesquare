// Implements: TASK-007 (REQ-023)

import Dexie, { type Table } from "dexie";
import type {
  User,
  Group,
  GroupMember,
  Expense,
  ExpensePayer,
  ExpenseSplit,
  Settlement,
  ActivityEntry,
} from "@/types";

export class ShareSquareDB extends Dexie {
  users!: Table<User, string>;
  groups!: Table<Group, string>;
  groupMembers!: Table<GroupMember, string>;
  expenses!: Table<Expense, string>;
  expensePayers!: Table<ExpensePayer, string>;
  expenseSplits!: Table<ExpenseSplit, string>;
  settlements!: Table<Settlement, string>;
  activityEntries!: Table<ActivityEntry, string>;

  constructor() {
    super("ShareSquare");
    this.version(1).stores({
      users: "id, &email",
      groups: "id, &inviteCode, createdBy",
      groupMembers: "id, groupId, userId, [groupId+userId]",
      expenses: "id, groupId, date, category, createdBy",
      expensePayers: "id, expenseId, userId",
      expenseSplits: "id, expenseId, userId",
      settlements: "id, groupId, fromUserId, toUserId",
      activityEntries: "id, userId, groupId, timestamp",
    });
  }
}

export const db = new ShareSquareDB();
