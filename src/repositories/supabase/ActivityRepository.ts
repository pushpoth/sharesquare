// Implements: TASK-013 (REQ-020, REQ-023, REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IActivityRepository } from "../interfaces/IActivityRepository";
import type { ActivityEntry } from "@/types";
import { activityRowToEntry, type ActivityEntryRow } from "./mappers";
import { throwIfError } from "./postgrestError";

export class SupabaseActivityRepository implements IActivityRepository {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Activity visible in any group the user belongs to (newest first), not only rows where `user_id` matches.
   */
  async getByUserId(userId: string, limit?: number): Promise<ActivityEntry[]> {
    const { data: memberRows, error: mErr } = await this.client
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);
    throwIfError(mErr);
    const groupIds = (memberRows as { group_id: string }[] | null)?.map((r) => r.group_id) ?? [];
    if (groupIds.length === 0) {
      return [];
    }

    let query = this.client
      .from("activity_entries")
      .select("*")
      .in("group_id", groupIds)
      .order("timestamp", { ascending: false });
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    const { data, error } = await query;
    throwIfError(error);
    return ((data as ActivityEntryRow[] | null) ?? []).map(activityRowToEntry);
  }

  async log(entry: Omit<ActivityEntry, "id" | "timestamp">): Promise<ActivityEntry> {
    const row = {
      user_id: entry.userId,
      group_id: entry.groupId,
      type: entry.type,
      description: entry.description,
      reference_id: entry.referenceId,
    };
    const { data, error } = await this.client.from("activity_entries").insert(row).select("*").single();
    throwIfError(error);
    if (!data) {
      throw new Error("Activity insert returned no row");
    }
    return activityRowToEntry(data as ActivityEntryRow);
  }
}
