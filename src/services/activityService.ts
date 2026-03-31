// Implements: TASK-021 (REQ-020)

import type { IActivityRepository } from "@/repositories/interfaces/IActivityRepository";
import type { ActivityEntry, ActivityType } from "@/types/activity";
import { formatCurrency } from "@/utils";

/**
 * Logs an activity entry via the repository.
 */
export async function logActivity(
  activityRepo: IActivityRepository,
  entry: Omit<ActivityEntry, "id" | "timestamp">,
): Promise<ActivityEntry> {
  return activityRepo.log(entry);
}

/**
 * Fetches activity feed for a user.
 */
export async function getActivityFeed(
  activityRepo: IActivityRepository,
  userId: string,
  limit?: number,
): Promise<ActivityEntry[]> {
  return activityRepo.getByUserId(userId, limit);
}

/**
 * Builds a human-readable activity description.
 */
export function buildActivityDescription(
  type: ActivityType,
  metadata: {
    userName?: string;
    title?: string;
    amount?: number;
    groupName?: string;
  },
  currencyCode = "USD",
): string {
  const { userName = "Someone", title = "", amount, groupName = "" } = metadata;

  switch (type) {
    case "expense_added":
      return `${userName} added '${title}' (${amount !== undefined ? formatCurrency(amount, currencyCode) : "?"}) in ${groupName}`;
    case "expense_edited":
      return `${userName} edited '${title}' in ${groupName}`;
    case "expense_deleted":
      return `${userName} deleted '${title}' from ${groupName}`;
    case "settlement_added":
      return `${userName} recorded a settlement in ${groupName}`;
    case "member_joined":
      return `${userName} joined ${groupName}`;
    case "group_created":
      return `${userName} created ${groupName}`;
    default:
      return `${userName} performed an action in ${groupName}`;
  }
}
