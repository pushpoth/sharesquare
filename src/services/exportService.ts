// Implements: TASK-019 (REQ-021)

import type { User } from "@/types/user";
import type { Group, GroupMember } from "@/types/group";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types/expense";
import type { Settlement } from "@/types/settlement";

export interface ShareSquareExport {
  version: string;
  exportedAt: string;
  users: User[];
  groups: Group[];
  groupMembers: GroupMember[];
  expenses: Expense[];
  expensePayers: ExpensePayer[];
  expenseSplits: ExpenseSplit[];
  settlements: Settlement[];
}

export interface ExportData {
  users: User[];
  groups: Group[];
  groupMembers: GroupMember[];
  expenses: Expense[];
  expensePayers: ExpensePayer[];
  expenseSplits: ExpenseSplit[];
  settlements: Settlement[];
}

/**
 * Builds a ShareSquareExport payload from raw data arrays.
 */
export function buildExportPayload(data: ExportData): ShareSquareExport {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    users: data.users ?? [],
    groups: data.groups ?? [],
    groupMembers: data.groupMembers ?? [],
    expenses: data.expenses ?? [],
    expensePayers: data.expensePayers ?? [],
    expenseSplits: data.expenseSplits ?? [],
    settlements: data.settlements ?? [],
  };
}

/**
 * Downloads a JSON string as a file in the browser.
 * Creates a Blob, object URL, anchor element, triggers click, revokes URL.
 */
export function downloadJson(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Returns a filename for export: sharesquare-export-YYYY-MM-DD.json
 */
export function generateExportFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `sharesquare-export-${year}-${month}-${day}.json`;
}
