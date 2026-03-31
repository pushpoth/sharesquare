// Implements: TASK-015 (REQ-001, REQ-002)

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  clearSession,
  ensureProfile,
  getSession,
  getSupabaseSession,
  loginOrCreateUser,
  setSession,
  signInWithGoogle,
  signInWithMagicLink,
  signOutSupabase,
  subscribeAuthState,
} from "./authService";
import type { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import type { User } from "@/types/user";

function mockSupabase(overrides: Partial<SupabaseClient> = {}): SupabaseClient {
  return {
    auth: {
      signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: "https://oauth" }, error: null }),
      signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
    ...overrides,
  } as unknown as SupabaseClient;
}

describe("authService — Supabase", () => {
  it("signInWithGoogle delegates to signInWithOAuth with redirect", async () => {
    const supabase = mockSupabase();
    await signInWithGoogle(supabase, { redirectTo: "http://localhost:5173/home" });
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "http://localhost:5173/home" },
    });
  });

  it("signInWithMagicLink delegates to signInWithOtp", async () => {
    const supabase = mockSupabase();
    await signInWithMagicLink(supabase, "a@b.co", { redirectTo: "http://localhost:5173/callback" });
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: "a@b.co",
      options: { emailRedirectTo: "http://localhost:5173/callback" },
    });
  });

  it("signOutSupabase calls auth.signOut", async () => {
    const supabase = mockSupabase();
    await signOutSupabase(supabase);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it("getSupabaseSession returns session from client", async () => {
    const session = { access_token: "t" } as unknown as import("@supabase/supabase-js").Session;
    const supabase = mockSupabase();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({ data: { session }, error: null });
    await expect(getSupabaseSession(supabase)).resolves.toBe(session);
  });

  it("subscribeAuthState wires onAuthStateChange", () => {
    const unsub = jest.fn();
    const supabase = mockSupabase();
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: unsub } },
    });
    const { unsubscribe } = subscribeAuthState(supabase, jest.fn());
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    unsubscribe();
    expect(unsub).toHaveBeenCalled();
  });

  it("ensureProfile upserts profiles from auth user metadata", async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    const supabase = mockSupabase();
    (supabase.from as jest.Mock).mockReturnValue({ upsert });

    await ensureProfile(supabase, {
      id: "uuid-1",
      email: "a@b.co",
      user_metadata: { full_name: "Alice", picture: "https://pic" },
    } as import("@supabase/supabase-js").User);

    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(upsert).toHaveBeenCalledWith(
      {
        id: "uuid-1",
        email: "a@b.co",
        display_name: "Alice",
        avatar_url: "https://pic",
      },
      { onConflict: "id" },
    );
  });
});

describe("authService — demo / IndexedDB", () => {
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
      expect(getSession()).toBe("user-123");
      expect(getItemSpy).toHaveBeenCalledWith("sharesquare_user_id");
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
