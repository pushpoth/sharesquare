// Implements: TASK-021 (REQ-020)

import {
  logActivity,
  getActivityFeed,
  buildActivityDescription,
} from "./activityService";
import type { IActivityRepository } from "@/repositories/interfaces/IActivityRepository";
import type { ActivityEntry } from "@/types/activity";

describe("activityService", () => {
  describe("logActivity", () => {
    it("delegates to activityRepo.log", async () => {
      const savedEntry: ActivityEntry = {
        id: "a1",
        userId: "u1",
        groupId: "g1",
        type: "expense_added",
        description: "Alice added 'Dinner' ($25.00) in Trip",
        referenceId: "e1",
        timestamp: "2025-01-01T00:00:00Z",
      };
      const activityRepo: IActivityRepository = {
        log: jest.fn().mockResolvedValue(savedEntry),
        getByUserId: jest.fn(),
      };

      const result = await logActivity(activityRepo, {
        userId: "u1",
        groupId: "g1",
        type: "expense_added",
        description: "Alice added 'Dinner' ($25.00) in Trip",
        referenceId: "e1",
      });

      expect(result).toEqual(savedEntry);
      expect(activityRepo.log).toHaveBeenCalledWith({
        userId: "u1",
        groupId: "g1",
        type: "expense_added",
        description: "Alice added 'Dinner' ($25.00) in Trip",
        referenceId: "e1",
      });
    });
  });

  describe("getActivityFeed", () => {
    it("delegates to activityRepo.getByUserId with limit", async () => {
      const entries: ActivityEntry[] = [];
      const activityRepo: IActivityRepository = {
        log: jest.fn(),
        getByUserId: jest.fn().mockResolvedValue(entries),
      };

      const result = await getActivityFeed(activityRepo, "u1", 10);

      expect(result).toEqual(entries);
      expect(activityRepo.getByUserId).toHaveBeenCalledWith("u1", 10);
    });

    it("delegates without limit when limit not provided", async () => {
      const entries: ActivityEntry[] = [];
      const activityRepo: IActivityRepository = {
        log: jest.fn(),
        getByUserId: jest.fn().mockResolvedValue(entries),
      };

      await getActivityFeed(activityRepo, "u2");

      expect(activityRepo.getByUserId).toHaveBeenCalledWith("u2", undefined);
    });
  });

  describe("buildActivityDescription", () => {
    const baseMeta = {
      userName: "Alice",
      title: "Dinner",
      amount: 2500,
      groupName: "Trip",
    };

    it("expense_added: includes amount formatted as currency", () => {
      const desc = buildActivityDescription("expense_added", baseMeta);
      expect(desc).toBe("Alice added 'Dinner' ($25.00) in Trip");
    });

    it("expense_edited: no amount", () => {
      const desc = buildActivityDescription("expense_edited", baseMeta);
      expect(desc).toBe("Alice edited 'Dinner' in Trip");
    });

    it("expense_deleted: no amount", () => {
      const desc = buildActivityDescription("expense_deleted", baseMeta);
      expect(desc).toBe("Alice deleted 'Dinner' from Trip");
    });

    it("settlement_added: no title or amount", () => {
      const desc = buildActivityDescription("settlement_added", {
        userName: "Bob",
        groupName: "Weekend",
      });
      expect(desc).toBe("Bob recorded a settlement in Weekend");
    });

    it("member_joined: no title or amount", () => {
      const desc = buildActivityDescription("member_joined", {
        userName: "Charlie",
        groupName: "Office",
      });
      expect(desc).toBe("Charlie joined Office");
    });

    it("group_created: no title or amount", () => {
      const desc = buildActivityDescription("group_created", {
        userName: "Diana",
        groupName: "Vacation",
      });
      expect(desc).toBe("Diana created Vacation");
    });
  });
});
