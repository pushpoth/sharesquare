// Implements: TASK-024 (REQ-003, REQ-004, REQ-005)

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { DuplicateError } from "@/repositories/errors";
import type { Group } from "@/types/group";
import type { RepositoryContextValue } from "@/contexts/RepositoryContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { useGroups } from "./useGroups";

const mockUser = {
  id: "u1",
  email: "a@b.com",
  name: "Alice",
  avatarUrl: "",
  createdAt: "2025-01-01T00:00:00.000Z",
};

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: mockUser }),
}));

jest.mock("@/services/inviteCodeService", () => ({
  generateUniqueCode: jest.fn(() => Promise.resolve("CODE-1234")),
  normalizeCode: (s: string) => s.trim().toUpperCase().replace(/\s+/g, ""),
}));

import { generateUniqueCode } from "@/services/inviteCodeService";

function buildMockRepos(partial: Partial<RepositoryContextValue> = {}): RepositoryContextValue {
  const base: RepositoryContextValue = {
    users: {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      getAll: jest.fn(),
    },
    groups: {
      findById: jest.fn(),
      findByInviteCode: jest.fn(),
      getByUserId: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      getMembers: jest.fn(),
      isMember: jest.fn(),
    },
    expenses: {
      findById: jest.fn(),
      getByGroupId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getPayers: jest.fn(),
      getSplits: jest.fn(),
    },
    settlements: {
      findById: jest.fn(),
      getByGroupId: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      log: jest.fn(),
      getByUserId: jest.fn(),
    },
  };
  return { ...base, ...partial, groups: { ...base.groups, ...partial.groups } };
}

describe("useGroups", () => {
  beforeEach(() => {
    jest.mocked(generateUniqueCode).mockResolvedValue("CODE-1234");
  });

  it("loads groups via refetch and exposes isLoading then data", async () => {
    const g: Group = {
      id: "g1",
      name: "Trip",
      inviteCode: "ABCD-1234",
      createdBy: "u1",
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    const getByUserId = jest.fn().mockResolvedValue([g]);
    const bundle = buildMockRepos({ groups: { ...buildMockRepos().groups, getByUserId } });

    const { result } = renderHook(() => useGroups(), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getByUserId).toHaveBeenCalledWith("u1");
    expect(result.current.groups).toEqual([g]);
    expect(result.current.error).toBeNull();
  });

  it("joinGroup uses findByInviteCode and addMember then refetches", async () => {
    const g: Group = {
      id: "g1",
      name: "Trip",
      inviteCode: "ABCD-1234",
      createdBy: "u2",
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    const findByInviteCode = jest.fn().mockResolvedValue(g);
    const isMember = jest.fn().mockResolvedValue(false);
    const addMember = jest.fn().mockResolvedValue(undefined);
    const getByUserId = jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([g]);

    const bundle = buildMockRepos({
      groups: {
        ...buildMockRepos().groups,
        findByInviteCode,
        isMember,
        addMember,
        getByUserId,
      },
    });

    const { result } = renderHook(() => useGroups(), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.joinGroup("abcd1234");
    });

    expect(findByInviteCode).toHaveBeenCalled();
    expect(addMember).toHaveBeenCalledWith("g1", "u1", "member");
    expect(getByUserId).toHaveBeenCalledTimes(2);
  });

  it("joinGroup throws on invalid code", async () => {
    const findByInviteCode = jest.fn().mockResolvedValue(undefined);
    const bundle = buildMockRepos({
      groups: { ...buildMockRepos().groups, findByInviteCode, getByUserId: jest.fn().mockResolvedValue([]) },
    });

    const { result } = renderHook(() => useGroups(), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.joinGroup("bad")).rejects.toThrow(/Invalid invite code/);
  });

  it("joinGroup throws when already a member", async () => {
    const g: Group = {
      id: "g1",
      name: "Trip",
      inviteCode: "ABCD-1234",
      createdBy: "u2",
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    const bundle = buildMockRepos({
      groups: {
        ...buildMockRepos().groups,
        findByInviteCode: jest.fn().mockResolvedValue(g),
        isMember: jest.fn().mockResolvedValue(true),
        getByUserId: jest.fn().mockResolvedValue([]),
      },
    });

    const { result } = renderHook(() => useGroups(), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.joinGroup("ABCD-1234")).rejects.toThrow(/already a member/);
  });

  it("createGroup retries on DuplicateError from create", async () => {
    const created: Group = {
      id: "g-new",
      name: "N",
      inviteCode: "CODE-1234",
      createdBy: "u1",
      createdAt: "2025-01-02T00:00:00.000Z",
    };
    const create = jest
      .fn()
      .mockRejectedValueOnce(new DuplicateError("invite taken"))
      .mockResolvedValueOnce(created);
    const getByUserId = jest.fn().mockResolvedValue([]);

    const bundle = buildMockRepos({
      groups: { ...buildMockRepos().groups, create, getByUserId },
    });

    const { result } = renderHook(() => useGroups(), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.createGroup("N");
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(jest.mocked(generateUniqueCode)).toHaveBeenCalled();
  });
});
