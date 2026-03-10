// Implements: TASK-020 (REQ-022)

import { validateImportJson } from "./importService";
import type { ShareSquareExport } from "./exportService";

describe("importService", () => {
  const validExport: ShareSquareExport = {
    version: "1.0",
    exportedAt: "2025-01-01T00:00:00Z",
    users: [
      {
        id: "u1",
        email: "a@b.com",
        name: "Alice",
        avatarUrl: "",
        createdAt: "2025-01-01T00:00:00Z",
      },
    ],
    groups: [],
    groupMembers: [],
    expenses: [],
    expensePayers: [],
    expenseSplits: [],
    settlements: [],
  };

  describe("validateImportJson", () => {
    it("returns valid with data for valid JSON", () => {
      const result = validateImportJson(JSON.stringify(validExport));

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.version).toBe("1.0");
        expect(result.data.users).toHaveLength(1);
        expect(result.data.users[0].email).toBe("a@b.com");
      }
    });

    it("returns errors for malformed JSON", () => {
      const result = validateImportJson("{ invalid json }");

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain("Invalid JSON");
      }
    });

    it("returns errors for missing required fields", () => {
      const incomplete = { version: "1.0" };
      const result = validateImportJson(JSON.stringify(incomplete));

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes("users"))).toBe(true);
        expect(result.errors.some((e) => e.includes("groups"))).toBe(true);
      }
    });

    it("returns errors for missing version", () => {
      const noVersion = { ...validExport, version: undefined };
      const result = validateImportJson(JSON.stringify(noVersion));

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.toLowerCase().includes("version"))).toBe(true);
      }
    });

    it("returns errors when version is not a string", () => {
      const badVersion = { ...validExport, version: 123 };
      const result = validateImportJson(JSON.stringify(badVersion));

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.toLowerCase().includes("version"))).toBe(true);
      }
    });

    it("returns errors for records missing id", () => {
      const badUsers = {
        ...validExport,
        users: [{ email: "a@b.com", name: "Alice" }],
      };
      const result = validateImportJson(JSON.stringify(badUsers));

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some((e) => e.includes("users[0]"))).toBe(true);
      }
    });
  });
});
