// Implements: TASK-027 (REQ-015)

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ValidationError } from "@/repositories/errors";
import type { RepositoryContextValue } from "@/contexts/RepositoryContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { useSettlements } from "./useSettlements";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: {
      id: "u1",
      email: "a@b.com",
      name: "Alice",
      avatarUrl: "",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  }),
}));

function mockBundle(): RepositoryContextValue {
  return {
    users: { findById: jest.fn(), findByEmail: jest.fn(), create: jest.fn(), getAll: jest.fn() },
    groups: {
      findById: jest.fn(),
      findByInviteCode: jest.fn(),
      getByUserId: jest.fn(),
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
      getByGroupId: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({
        id: "s1",
        groupId: "g1",
        fromUserId: "u1",
        toUserId: "u2",
        amount: 500,
        date: "2025-01-01",
        createdAt: "2025-01-01T00:00:00.000Z",
      }),
      delete: jest.fn(),
    },
    activity: {
      log: jest.fn().mockResolvedValue({
        id: "a1",
        userId: "u1",
        groupId: "g1",
        type: "settlement_added",
        description: "x",
        referenceId: "s1",
        timestamp: "2025-01-01T00:00:00.000Z",
      }),
      getByUserId: jest.fn(),
    },
  };
}

describe("useSettlements", () => {
  it("rejects non-positive amounts", async () => {
    const bundle = mockBundle();
    const { result } = renderHook(() => useSettlements("g1"), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.settlements).toEqual([]));

    await expect(
      result.current.addSettlement({
        groupId: "g1",
        fromUserId: "u1",
        toUserId: "u2",
        amount: 0,
        date: "2025-01-01",
      }),
    ).rejects.toThrow(ValidationError);

    await expect(
      result.current.addSettlement({
        groupId: "g1",
        fromUserId: "u1",
        toUserId: "u2",
        amount: -100,
        date: "2025-01-01",
      }),
    ).rejects.toThrow(ValidationError);

    expect(bundle.settlements.create).not.toHaveBeenCalled();
  });

  it("calls create and logs activity for valid settlement", async () => {
    const bundle = mockBundle();
    const { result } = renderHook(() => useSettlements("g1"), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.settlements).toEqual([]));

    await act(async () => {
      await result.current.addSettlement({
        groupId: "g1",
        fromUserId: "u1",
        toUserId: "u2",
        amount: 500,
        date: "2025-01-01",
      });
    });

    expect(bundle.settlements.create).toHaveBeenCalled();
    expect(bundle.activity.log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "settlement_added",
        referenceId: "s1",
      }),
    );
  });
});
