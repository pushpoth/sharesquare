// Implements: TASK-026 (REQ-013, REQ-014)

import React from "react";
import { renderHook, waitFor } from "@testing-library/react";

/** Real `useLiveQuery` only settles when Dexie is touched; mock repos need this shim. */
jest.mock("dexie-react-hooks", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  return {
    useLiveQuery: (fn: () => Promise<unknown>, deps: readonly unknown[]) => {
      const [val, setVal] = React.useState(undefined);
      React.useEffect(() => {
        let on = true;
        void fn().then((r) => {
          if (on) setVal(r);
        });
        return () => {
          on = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- test double mirrors dexie-react-hooks deps
      }, [...deps]);
      return val;
    },
  };
});
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types/expense";
import type { RepositoryContextValue } from "@/contexts/RepositoryContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { useBalances, useOverallBalances } from "./useBalances";

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

function expenseBundle(e: Expense, payers: ExpensePayer[], splits: ExpenseSplit[]): RepositoryContextValue {
  return {
    users: { findById: jest.fn(), findByEmail: jest.fn(), create: jest.fn(), getAll: jest.fn() },
    groups: {
      findById: jest.fn(),
      findByInviteCode: jest.fn(),
      getByUserId: jest.fn().mockResolvedValue([
        {
          id: "g1",
          name: "G",
          inviteCode: "X",
          createdBy: "u1",
          createdAt: "2025-01-01T00:00:00.000Z",
        },
      ]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addMember: jest.fn(),
      getMembers: jest.fn(),
      isMember: jest.fn(),
    },
    expenses: {
      findById: jest.fn(),
      getByGroupId: jest.fn().mockResolvedValue([e]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getPayers: jest.fn().mockImplementation((id: string) =>
        Promise.resolve(payers.filter((p) => p.expenseId === id)),
      ),
      getSplits: jest.fn().mockImplementation((id: string) =>
        Promise.resolve(splits.filter((s) => s.expenseId === id)),
      ),
    },
    settlements: {
      findById: jest.fn(),
      getByGroupId: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      delete: jest.fn(),
    },
    activity: { log: jest.fn(), getByUserId: jest.fn() },
  };
}

describe("useBalances", () => {
  it("computes member balances in integer cents from repository data", async () => {
    const e: Expense = {
      id: "e1",
      groupId: "g1",
      title: "Dinner",
      amount: 1000,
      date: "2025-01-01",
      category: "food",
      createdBy: "u1",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };
    const payers: ExpensePayer[] = [{ id: "p1", expenseId: "e1", userId: "u1", amount: 1000 }];
    const splits: ExpenseSplit[] = [{ id: "s1", expenseId: "e1", userId: "u2", amountOwed: 1000 }];
    const bundle = expenseBundle(e, payers, splits);

    const { result } = renderHook(() => useBalances("g1"), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.memberBalances.get("u1")).toBe(1000);
    expect(result.current.memberBalances.get("u2")).toBe(-1000);
    expect(result.current.simplifiedDebts).toEqual(
      expect.arrayContaining([expect.objectContaining({ from: "u2", to: "u1", amount: 1000 })]),
    );
  });

  it("useOverallBalances aggregates across groups", async () => {
    const e: Expense = {
      id: "e1",
      groupId: "g1",
      title: "Dinner",
      amount: 1000,
      date: "2025-01-01",
      category: "food",
      createdBy: "u1",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };
    const payers: ExpensePayer[] = [{ id: "p1", expenseId: "e1", userId: "u1", amount: 1000 }];
    const splits: ExpenseSplit[] = [{ id: "s1", expenseId: "e1", userId: "u2", amountOwed: 1000 }];
    const bundle = expenseBundle(e, payers, splits);

    const { result } = renderHook(() => useOverallBalances(), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.youOwe).toBe(0);
    expect(result.current.owedToYou).toBe(1000);
    expect(result.current.overallBalance).toBe(1000);
  });
});
