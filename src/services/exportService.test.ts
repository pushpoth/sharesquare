// Implements: TASK-019 (REQ-021)

import { buildExportPayload, downloadJson, generateExportFilename } from "./exportService";
import type { User } from "@/types/user";
import type { Group } from "@/types/group";

describe("exportService", () => {
  describe("buildExportPayload", () => {
    it("returns correct structure with version and exportedAt", () => {
      const before = new Date().toISOString();
      const payload = buildExportPayload({
        users: [],
        groups: [],
        groupMembers: [],
        expenses: [],
        expensePayers: [],
        expenseSplits: [],
        settlements: [],
      });
      const after = new Date().toISOString();

      expect(payload.version).toBe("1.0");
      expect(payload.exportedAt).toBeDefined();
      expect(payload.exportedAt >= before && payload.exportedAt <= after).toBe(true);
      expect(payload.users).toEqual([]);
      expect(payload.groups).toEqual([]);
      expect(payload.groupMembers).toEqual([]);
      expect(payload.expenses).toEqual([]);
      expect(payload.expensePayers).toEqual([]);
      expect(payload.expenseSplits).toEqual([]);
      expect(payload.settlements).toEqual([]);
    });

    it("includes provided data in payload", () => {
      const user: User = {
        id: "u1",
        email: "a@b.com",
        name: "Alice",
        avatarUrl: "",
        createdAt: "2025-01-01T00:00:00Z",
      };
      const group: Group = {
        id: "g1",
        name: "Trip",
        inviteCode: "abc",
        createdBy: "u1",
        createdAt: "2025-01-01T00:00:00Z",
      };
      const payload = buildExportPayload({
        users: [user],
        groups: [group],
        groupMembers: [],
        expenses: [],
        expensePayers: [],
        expenseSplits: [],
        settlements: [],
      });

      expect(payload.users).toHaveLength(1);
      expect(payload.users[0]).toEqual(user);
      expect(payload.groups).toHaveLength(1);
      expect(payload.groups[0]).toEqual(group);
    });

    it("empty data produces valid JSON with empty arrays", () => {
      const payload = buildExportPayload({
        users: [],
        groups: [],
        groupMembers: [],
        expenses: [],
        expensePayers: [],
        expenseSplits: [],
        settlements: [],
      });
      const jsonString = JSON.stringify(payload);
      const parsed = JSON.parse(jsonString);

      expect(parsed.version).toBe("1.0");
      expect(parsed.users).toEqual([]);
      expect(parsed.groups).toEqual([]);
      expect(parsed.groupMembers).toEqual([]);
      expect(parsed.expenses).toEqual([]);
      expect(parsed.expensePayers).toEqual([]);
      expect(parsed.expenseSplits).toEqual([]);
      expect(parsed.settlements).toEqual([]);
    });
  });

  describe("generateExportFilename", () => {
    it("produces correct format sharesquare-export-YYYY-MM-DD.json", () => {
      const filename = generateExportFilename();
      const match = filename.match(/^sharesquare-export-(\d{4})-(\d{2})-(\d{2})\.json$/);
      expect(match).not.toBeNull();
      expect(filename).toBe(`sharesquare-export-${match![1]}-${match![2]}-${match![3]}.json`);
    });

    it("uses current date", () => {
      const now = new Date();
      const filename = generateExportFilename();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      expect(filename).toBe(`sharesquare-export-${year}-${month}-${day}.json`);
    });
  });

  describe("downloadJson", () => {
    it("creates blob and clicks link", () => {
      const createElementSpy = jest.spyOn(document, "createElement");
      const mockCreateObjectURL = jest.fn(() => "blob:mock-url");
      const mockRevokeObjectURL = jest.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockAnchor = {
        href: "",
        download: "",
        click: jest.fn(),
      };
      createElementSpy.mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

      downloadJson('{"test": true}', "test.json");

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockCreateObjectURL).toHaveBeenCalled();
      const calls = mockCreateObjectURL.mock.calls as unknown[][];
      expect(calls.length).toBeGreaterThan(0);
      const blob = calls[0][0] as Blob;
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe("application/json");
      expect(mockAnchor.download).toBe("test.json");
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });
});
