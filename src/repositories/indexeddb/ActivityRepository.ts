// Implements: TASK-013 (REQ-024)

import type { ShareSquareDB } from "./database";
import type { IActivityRepository } from "../interfaces/IActivityRepository";
import type { ActivityEntry } from "@/types";
import { generateId } from "@/utils/idGenerator";
import { toISOTimestamp } from "@/utils/dateUtils";

export class DexieActivityRepository implements IActivityRepository {
  constructor(private readonly db: ShareSquareDB) {}

  async getByUserId(userId: string, limit?: number): Promise<ActivityEntry[]> {
    let entries = await this.db.activityEntries
      .where("userId")
      .equals(userId)
      .sortBy("timestamp");
    entries = entries.reverse();
    if (limit !== undefined) {
      entries = entries.slice(0, limit);
    }
    return entries;
  }

  async log(
    entry: Omit<ActivityEntry, "id" | "timestamp">
  ): Promise<ActivityEntry> {
    const id = generateId();
    const timestamp = toISOTimestamp();
    const newEntry: ActivityEntry = { ...entry, id, timestamp };
    await this.db.activityEntries.put(newEntry);
    return newEntry;
  }
}
