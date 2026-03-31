// Implements: TASK-025 (REQ-006, REQ-011, REQ-012)

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";

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
import type { Expense } from "@/types/expense";
import type { RepositoryContextValue } from "@/contexts/RepositoryContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { useExpenses } from "./useExpenses";

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

function mockBundle(): RepositoryContextValue {
  const created: Expense = {
    id: "e1",
    groupId: "g1",
    title: "Dinner",
    amount: 2500,
    date: "2025-01-02",
    category: "food",
    createdBy: "u1",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  };
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
      findById: jest.fn().mockResolvedValue(created),
      getByGroupId: jest.fn().mockResolvedValue([created]),
      create: jest.fn().mockResolvedValue(created),
      update: jest.fn().mockImplementation(async (_id, partial) => ({ ...created, ...partial })),
      delete: jest.fn().mockResolvedValue(undefined),
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
      log: jest.fn().mockImplementation(async (entry) => ({
        id: "a1",
        ...entry,
        timestamp: "2025-01-01T00:00:00.000Z",
      })),
      getByUserId: jest.fn(),
    },
  };
}

describe("useExpenses", () => {
  it("logs activity on addExpense", async () => {
    const bundle = mockBundle();
    const { result } = renderHook(() => useExpenses("g1"), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => {
      expect(result.current.expenses.length).toBeGreaterThan(0);
    });

    await act(async () => {
      await result.current.addExpense(
        {
          groupId: "g1",
          title: "Lunch",
          amount: 1000,
          date: "2025-01-03",
          category: "food",
          createdBy: "u1",
        },
        [{ userId: "u1", amount: 1000 }],
        [{ userId: "u1", amountOwed: 1000 }],
      );
    });

    expect(bundle.activity.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        groupId: "g1",
        type: "expense_added",
        referenceId: "e1",
      }),
    );
  });

  it("logs activity on updateExpense and deleteExpense", async () => {
    const bundle = mockBundle();
    const { result } = renderHook(() => useExpenses("g1"), {
      wrapper: ({ children }) => <RepositoryProvider value={bundle}>{children}</RepositoryProvider>,
    });

    await waitFor(() => expect(result.current.expenses.length).toBeGreaterThan(0));

    await act(async () => {
      await result.current.updateExpense("e1", { title: "Updated" });
    });

    expect(bundle.activity.log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "expense_edited",
        referenceId: "e1",
      }),
    );

    await act(async () => {
      await result.current.deleteExpense("e1");
    });

    expect(bundle.activity.log).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "expense_deleted",
        referenceId: "e1",
      }),
    );
  });
});
