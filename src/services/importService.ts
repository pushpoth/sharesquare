// Implements: TASK-020 (REQ-022)

import type { ShareSquareExport } from "./exportService";
import type { ShareSquareDB } from "@/repositories/indexeddb/database";
import type { User } from "@/types/user";
import type { Group, GroupMember } from "@/types/group";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types/expense";
import type { Settlement } from "@/types/settlement";

const REQUIRED_ARRAYS = [
  "users",
  "groups",
  "groupMembers",
  "expenses",
  "expensePayers",
  "expenseSplits",
  "settlements",
] as const;

export type ValidateResult =
  | { valid: true; data: ShareSquareExport }
  | { valid: false; errors: string[] };

/**
 * Validates import JSON: parse, check version, required arrays, basic types.
 */
export function validateImportJson(jsonString: string): ValidateResult {
  const errors: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { valid: false, errors: [`Invalid JSON: ${e.message}`] };
    }
    throw e;
  }

  if (parsed === null || typeof parsed !== "object") {
    return { valid: false, errors: ["Root must be an object"] };
  }

  const obj = parsed as Record<string, unknown>;

  if (!obj.version || typeof obj.version !== "string") {
    errors.push("Missing or invalid 'version' field");
  }

  for (const key of REQUIRED_ARRAYS) {
    const val = obj[key];
    if (!Array.isArray(val)) {
      errors.push(`Missing or invalid '${key}' array`);
    } else {
      for (let i = 0; i < val.length; i++) {
        const item = val[i];
        if (item === null || typeof item !== "object") {
          errors.push(`${key}[${i}]: must be an object`);
        } else if (!("id" in item) || typeof (item as { id?: unknown }).id !== "string") {
          errors.push(`${key}[${i}]: missing or invalid 'id'`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: obj as unknown as ShareSquareExport };
}

export type ImportStrategy = "overwrite" | "skip";

/**
 * Abstraction for import writes so unit tests can mock persistence (and future
 * repository-backed Supabase import can plug in without changing call sites).
 */
export interface ImportDataWriter {
  findUserById(id: string): Promise<User | undefined>;
  putUser(user: User): Promise<void>;
  findGroupById(id: string): Promise<Group | undefined>;
  putGroup(group: Group): Promise<void>;
  findGroupMemberById(id: string): Promise<GroupMember | undefined>;
  putGroupMember(member: GroupMember): Promise<void>;
  findExpenseById(id: string): Promise<Expense | undefined>;
  putExpense(expense: Expense): Promise<void>;
  findExpensePayerById(id: string): Promise<ExpensePayer | undefined>;
  putExpensePayer(payer: ExpensePayer): Promise<void>;
  findExpenseSplitById(id: string): Promise<ExpenseSplit | undefined>;
  putExpenseSplit(split: ExpenseSplit): Promise<void>;
  findSettlementById(id: string): Promise<Settlement | undefined>;
  putSettlement(settlement: Settlement): Promise<void>;
}

export function createDexieImportWriter(db: ShareSquareDB): ImportDataWriter {
  return {
    findUserById: (id) => db.users.get(id),
    putUser: (u) => db.users.put(u),
    findGroupById: (id) => db.groups.get(id),
    putGroup: (g) => db.groups.put(g),
    findGroupMemberById: (id) => db.groupMembers.get(id),
    putGroupMember: (m) => db.groupMembers.put(m),
    findExpenseById: (id) => db.expenses.get(id),
    putExpense: (e) => db.expenses.put(e),
    findExpensePayerById: (id) => db.expensePayers.get(id),
    putExpensePayer: (p) => db.expensePayers.put(p),
    findExpenseSplitById: (id) => db.expenseSplits.get(id),
    putExpenseSplit: (s) => db.expenseSplits.put(s),
    findSettlementById: (id) => db.settlements.get(id),
    putSettlement: (s) => db.settlements.put(s),
  };
}

type ImportRecord =
  | User
  | Group
  | GroupMember
  | Expense
  | ExpensePayer
  | ExpenseSplit
  | Settlement;

async function importRecord(
  strategy: ImportStrategy,
  find: (id: string) => Promise<ImportRecord | undefined>,
  put: (r: ImportRecord) => Promise<void>,
  record: ImportRecord & { id: string },
): Promise<{ imported: number; skipped: number }> {
  if (strategy === "overwrite") {
    await put(record);
    return { imported: 1, skipped: 0 };
  }
  const existing = await find(record.id);
  if (existing) {
    return { imported: 0, skipped: 1 };
  }
  await put(record);
  return { imported: 1, skipped: 0 };
}

/**
 * Imports ShareSquareExport data through an ImportDataWriter.
 * overwrite: replace every row by id.
 * skip: keep existing rows; insert only when id is missing.
 */
export async function importData(
  writer: ImportDataWriter,
  data: ShareSquareExport,
  strategy: ImportStrategy,
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  const steps: {
    records: ImportRecord[];
    find: (id: string) => Promise<ImportRecord | undefined>;
    put: (r: ImportRecord) => Promise<void>;
  }[] = [
    {
      records: data.users,
      find: (id) => writer.findUserById(id),
      put: (r) => writer.putUser(r as User),
    },
    {
      records: data.groups,
      find: (id) => writer.findGroupById(id),
      put: (r) => writer.putGroup(r as Group),
    },
    {
      records: data.groupMembers,
      find: (id) => writer.findGroupMemberById(id),
      put: (r) => writer.putGroupMember(r as GroupMember),
    },
    {
      records: data.expenses,
      find: (id) => writer.findExpenseById(id),
      put: (r) => writer.putExpense(r as Expense),
    },
    {
      records: data.expensePayers,
      find: (id) => writer.findExpensePayerById(id),
      put: (r) => writer.putExpensePayer(r as ExpensePayer),
    },
    {
      records: data.expenseSplits,
      find: (id) => writer.findExpenseSplitById(id),
      put: (r) => writer.putExpenseSplit(r as ExpenseSplit),
    },
    {
      records: data.settlements,
      find: (id) => writer.findSettlementById(id),
      put: (r) => writer.putSettlement(r as Settlement),
    },
  ];

  for (const { records, find, put } of steps) {
    for (const record of records) {
      const r = record as ImportRecord & { id: string };
      const delta = await importRecord(strategy, find, put, r);
      imported += delta.imported;
      skipped += delta.skipped;
    }
  }

  return { imported, skipped };
}
