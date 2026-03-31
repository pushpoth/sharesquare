// Implements: TASK-008 (REQ-024)

import { ActivityEntry } from "@/types";

export interface IActivityRepository {
  getByUserId(userId: string, limit?: number): Promise<ActivityEntry[]>;
  log(entry: Omit<ActivityEntry, "id" | "timestamp">): Promise<ActivityEntry>;
}
