// Implements: TASK-015 (REQ-001, REQ-002)

import {
  decodeGoogleCredential,
  loginOrCreateUser,
  getSession,
  setSession,
  clearSession,
} from "./authService";
import type { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import type { User } from "@/types/user";

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createTestJWT(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode("mock-signature");
  return `${header}.${payloadPart}.${signature}`;
}

describe("authService", () => {
  describe("decodeGoogleCredential", () => {
    it("decodes JWT and extracts email, name, picture", () => {
      const payload = {
        email: "alice@example.com",
        name: "Alice Smith",
        picture: "https://example.com/avatar.png",
      };
      const credential = createTestJWT(payload);

      const result = decodeGoogleCredential(credential);

      expect(result).toEqual({
        email: "alice@example.com",
        name: "Alice Smith",
        picture: "https://example.com/avatar.png",
      });
    });

    it("throws on invalid JWT (missing payload)", () => {
      expect(() => decodeGoogleCredential("invalid")).toThrow("Invalid JWT: missing payload");
    });

    it("throws when payload missing required fields", () => {
      const credential = createTestJWT({ email: "a@b.com" });
      expect(() => decodeGoogleCredential(credential)).toThrow(
        "Invalid JWT payload: missing email, name, or picture",
      );
    });
  });

  describe("loginOrCreateUser", () => {
    it("returns existing user when findByEmail finds one", async () => {
      const existingUser: User = {
        id: "u1",
        email: "alice@example.com",
        name: "Alice",
        avatarUrl: "https://example.com/avatar.png",
        createdAt: "2025-01-01T00:00:00Z",
      };
      const userRepo: IUserRepository = {
        findByEmail: jest.fn().mockResolvedValue(existingUser),
        create: jest.fn(),
        findById: jest.fn(),
        getAll: jest.fn(),
      };

      const result = await loginOrCreateUser(userRepo, {
        email: "alice@example.com",
        name: "Alice Smith",
        picture: "https://example.com/avatar.png",
      });

      expect(result).toEqual(existingUser);
      expect(userRepo.findByEmail).toHaveBeenCalledWith("alice@example.com");
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it("creates new user when findByEmail returns undefined", async () => {
      const newUser: User = {
        id: "u2",
        email: "bob@example.com",
        name: "Bob",
        avatarUrl: "https://example.com/bob.png",
        createdAt: "2025-01-01T00:00:00Z",
      };
      const userRepo: IUserRepository = {
        findByEmail: jest.fn().mockResolvedValue(undefined),
        create: jest.fn().mockResolvedValue(newUser),
        findById: jest.fn(),
        getAll: jest.fn(),
      };

      const result = await loginOrCreateUser(userRepo, {
        email: "bob@example.com",
        name: "Bob",
        picture: "https://example.com/bob.png",
      });

      expect(result).toEqual(newUser);
      expect(userRepo.findByEmail).toHaveBeenCalledWith("bob@example.com");
      expect(userRepo.create).toHaveBeenCalledWith({
        email: "bob@example.com",
        name: "Bob",
        avatarUrl: "https://example.com/bob.png",
      });
    });
  });

  describe("session (getSession, setSession, clearSession)", () => {
    let getItemSpy: jest.SpyInstance;
    let setItemSpy: jest.SpyInstance;
    let removeItemSpy: jest.SpyInstance;

    beforeEach(() => {
      getItemSpy = jest.spyOn(Storage.prototype, "getItem");
      setItemSpy = jest.spyOn(Storage.prototype, "setItem");
      removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");
    });

    afterEach(() => {
      getItemSpy.mockRestore();
      setItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    });

    it("getSession reads sharesquare_user_id from localStorage", () => {
      getItemSpy.mockReturnValue("user-123");

      const result = getSession();

      expect(result).toBe("user-123");
      expect(getItemSpy).toHaveBeenCalledWith("sharesquare_user_id");
    });

    it("getSession returns null when key not set", () => {
      getItemSpy.mockReturnValue(null);

      const result = getSession();

      expect(result).toBeNull();
    });

    it("setSession writes userId to localStorage", () => {
      setSession("user-456");

      expect(setItemSpy).toHaveBeenCalledWith("sharesquare_user_id", "user-456");
    });

    it("clearSession removes key from localStorage", () => {
      clearSession();

      expect(removeItemSpy).toHaveBeenCalledWith("sharesquare_user_id");
    });
  });
});
