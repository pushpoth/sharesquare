// Implements: TASK-022 (REQ-001, REQ-002)

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import * as authService from "@/services/authService";
import type { User } from "@/types/user";
import { repositories } from "@/repositories";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "@/hooks/useAuth";

jest.mock("@/repositories", () => ({
  repositories: {
    users: {
      findById: jest.fn(),
    },
  },
}));

jest.mock("@/repositories/supabase/readEnv", () => ({
  isSupabaseAuthConfigured: jest.fn(() => false),
}));

jest.mock("@/services/authService", () => ({
  getSession: jest.fn(),
  clearSession: jest.fn(),
  setSession: jest.fn(),
  getSupabaseSession: jest.fn(),
  ensureProfile: jest.fn().mockResolvedValue(undefined),
  loginOrCreateUser: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOutSupabase: jest.fn().mockResolvedValue(undefined),
  subscribeAuthState: jest.fn(() => ({ unsubscribe: jest.fn() })),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext / useAuth", () => {
  const mockUser: User = {
    id: "user-1",
    email: "alice@example.com",
    name: "Alice",
    avatarUrl: "",
    createdAt: "2025-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.mocked(authService.getSession).mockReturnValue(null);
    jest.mocked(repositories.users.findById).mockReset();
  });

  it("throws when useAuth is used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/useAuth must be used within AuthProvider/);
  });

  it("demo path: no stored id finishes loading with null user and null Supabase session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentUser).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("demo path: restores profile from repositories when session id exists in storage", async () => {
    jest.mocked(authService.getSession).mockReturnValue("user-1");
    jest.mocked(repositories.users.findById).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(repositories.users.findById).toHaveBeenCalledWith("user-1");
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logout clears session helper and user", async () => {
    jest.mocked(authService.getSession).mockReturnValue("user-1");
    jest.mocked(repositories.users.findById).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.clearSession).toHaveBeenCalled();
    expect(result.current.currentUser).toBeNull();
  });

  it("signOut is an alias for logout", async () => {
    jest.mocked(authService.getSession).mockReturnValue("user-1");
    jest.mocked(repositories.users.findById).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(authService.clearSession).toHaveBeenCalled();
    expect(result.current.currentUser).toBeNull();
  });

  it("signInWithDemoProfile loads user and persists id via setSession", async () => {
    jest.mocked(authService.loginOrCreateUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signInWithDemoProfile({
        email: mockUser.email,
        name: mockUser.name,
        picture: mockUser.avatarUrl,
      });
    });

    expect(authService.loginOrCreateUser).toHaveBeenCalled();
    expect(authService.setSession).toHaveBeenCalledWith(mockUser.id);
    expect(result.current.currentUser).toEqual(mockUser);
  });
});
