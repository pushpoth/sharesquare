// Implements: TASK-016 (REQ-003, REQ-004)

import { generateUniqueCode, normalizeCode } from "./inviteCodeService";
import type { IGroupRepository } from "@/repositories/interfaces/IGroupRepository";
import type { Group } from "@/types/group";

const CODE_FORMAT = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

describe("inviteCodeService", () => {
  describe("generateUniqueCode", () => {
    it("generates code matching format XXXX-XXXX", async () => {
      const groupRepo: IGroupRepository = {
        findByInviteCode: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        getByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        addMember: jest.fn(),
        getMembers: jest.fn(),
        isMember: jest.fn(),
      };

      const code = await generateUniqueCode(groupRepo);

      expect(code).toMatch(CODE_FORMAT);
    });

    it("retries on collision until unique code found", async () => {
      const existingGroup: Group = {
        id: "g1",
        name: "Trip",
        inviteCode: "ABCD-1234",
        createdBy: "u1",
        createdAt: "2025-01-01T00:00:00Z",
      };
      const groupRepo: IGroupRepository = {
        findByInviteCode: jest
          .fn()
          .mockResolvedValueOnce(existingGroup)
          .mockResolvedValueOnce(undefined),
        findById: jest.fn(),
        getByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        addMember: jest.fn(),
        getMembers: jest.fn(),
        isMember: jest.fn(),
      };

      const code = await generateUniqueCode(groupRepo);

      expect(code).toMatch(CODE_FORMAT);
      expect(groupRepo.findByInviteCode).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries when all codes collide", async () => {
      const existingGroup: Group = {
        id: "g1",
        name: "Trip",
        inviteCode: "ABCD-1234",
        createdBy: "u1",
        createdAt: "2025-01-01T00:00:00Z",
      };
      const groupRepo: IGroupRepository = {
        findByInviteCode: jest.fn().mockResolvedValue(existingGroup),
        findById: jest.fn(),
        getByUserId: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        addMember: jest.fn(),
        getMembers: jest.fn(),
        isMember: jest.fn(),
      };

      await expect(generateUniqueCode(groupRepo)).rejects.toThrow(
        "Failed to generate unique invite code after 10 attempts",
      );
      expect(groupRepo.findByInviteCode).toHaveBeenCalledTimes(10);
    });
  });

  describe("normalizeCode", () => {
    it("converts lowercase to uppercase", () => {
      expect(normalizeCode("abcd-1234")).toBe("ABCD-1234");
    });

    it("strips spaces", () => {
      expect(normalizeCode("ABCD 1234")).toBe("ABCD1234");
      expect(normalizeCode("AB CD - 12 34")).toBe("ABCD-1234");
    });

    it("trims whitespace", () => {
      expect(normalizeCode("  ABCD-1234  ")).toBe("ABCD-1234");
    });

    it("handles combined transformations", () => {
      expect(normalizeCode("  ab cd - 12 34  ")).toBe("ABCD-1234");
    });
  });
});
