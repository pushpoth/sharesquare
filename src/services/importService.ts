// Implements: TASK-020 (REQ-022)

import type { ShareSquareExport } from "./exportService";
import type { ShareSquareDB } from "@/repositories/indexeddb/database";

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
 * Imports ShareSquareExport data into the database.
 * overwrite: upsert all records.
 * skip: only add records that don't already exist.
 */
export async function importData(
  db: ShareSquareDB,
  data: ShareSquareExport,
  strategy: ImportStrategy
): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;

  const tables: { key: keyof ShareSquareExport; table: keyof ShareSquareDB }[] = [
    { key: "users", table: "users" },
    { key: "groups", table: "groups" },
    { key: "groupMembers", table: "groupMembers" },
    { key: "expenses", table: "expenses" },
    { key: "expensePayers", table: "expensePayers" },
    { key: "expenseSplits", table: "expenseSplits" },
    { key: "settlements", table: "settlements" },
  ];

  for (const { key, table } of tables) {
    const records = data[key] as { id: string }[];
    if (!Array.isArray(records)) continue;

    const dbTable = db[table] as { get: (id: string) => Promise<unknown>; put: (r: unknown) => Promise<void> };

    for (const record of records) {
      if (strategy === "overwrite") {
        await dbTable.put(record);
        imported++;
      } else {
        const existing = await dbTable.get(record.id);
        if (existing) {
          skipped++;
        } else {
          await dbTable.put(record);
          imported++;
        }
      }
    }
  }

  return { imported, skipped };
}
