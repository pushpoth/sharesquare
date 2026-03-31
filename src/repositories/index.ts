// Implements: TASK-014 (REQ-024)

import { db } from "./indexeddb/database";
import { DexieUserRepository } from "./indexeddb/UserRepository";
import { DexieGroupRepository } from "./indexeddb/GroupRepository";
import { DexieExpenseRepository } from "./indexeddb/ExpenseRepository";
import { DexieSettlementRepository } from "./indexeddb/SettlementRepository";
import { DexieActivityRepository } from "./indexeddb/ActivityRepository";

export const repositories = {
  users: new DexieUserRepository(db),
  groups: new DexieGroupRepository(db),
  expenses: new DexieExpenseRepository(db),
  settlements: new DexieSettlementRepository(db),
  activity: new DexieActivityRepository(db),
};
