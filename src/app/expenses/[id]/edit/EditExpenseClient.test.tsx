// Implements: TASK-049 (REQ-011)

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("dexie-react-hooks", () => {
  const ReactMod = jest.requireActual<typeof import("react")>("react");
  return {
    useLiveQuery: (fn: () => Promise<unknown>, deps: readonly unknown[]) => {
      const [val, setVal] = ReactMod.useState<unknown>(undefined);
      ReactMod.useEffect(() => {
        let on = true;
        void fn().then((r) => {
          if (on) setVal(r);
        });
        return () => {
          on = false;
        };
      }, [...deps]);
      return val;
    },
  };
});

jest.mock("@/layouts/AppLayout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout-stub">{children}</div>
  ),
}));

jest.mock("@/components/Toast/Toast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/components/ExpenseForm/ExpenseForm", () => ({
  ExpenseForm: () => <div data-testid="expense-form">form</div>,
}));

jest.mock("@/hooks/useExpenses", () => {
  const hook = {
    expenses: [] as unknown[],
    addExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
  };
  return { useExpenses: () => hook, __expensesHook: hook };
});

jest.mock("@/contexts/RepositoryContext", () => {
  const expense = {
    id: "e1",
    groupId: "g1",
    title: "Dinner",
    amount: 2500,
    date: "2026-01-02",
    category: "food",
    createdBy: "u1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
  const mockRepos = {
    expenses: {
      findById: jest.fn().mockResolvedValue(expense),
      getPayers: jest.fn().mockResolvedValue([
        { id: "p1", expenseId: "e1", userId: "u1", amount: 2500 },
      ]),
      getSplits: jest.fn().mockResolvedValue([
        { id: "s1", expenseId: "e1", userId: "u1", amountOwed: 2500 },
      ]),
    },
    groups: {
      getMembers: jest.fn().mockResolvedValue([
        {
          id: "gm1",
          groupId: "g1",
          userId: "u1",
          role: "admin" as const,
          joinedAt: "2026-01-01T00:00:00Z",
        },
      ]),
    },
    users: {
      findById: jest.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        name: "Alice",
        avatarUrl: "",
        createdAt: "2026-01-01T00:00:00Z",
      }),
    },
  };
  return { useRepositories: () => mockRepos };
});

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual<typeof import("react-router-dom")>("react-router-dom");
  const navigate = jest.fn();
  return { ...actual, useNavigate: () => navigate };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EditExpenseClient = require("./EditExpenseClient").default as typeof import("./EditExpenseClient").default;

function renderEdit(id = "e1") {
  return render(
    <MemoryRouter initialEntries={[`/expenses/${id}/edit`]}>
      <Routes>
        <Route path="/expenses/:id/edit" element={<EditExpenseClient />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EditExpenseClient (TASK-049)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading shell on edit-expense-page then expense form when expense loads", async () => {
    renderEdit("e1");
    expect(screen.getByTestId("edit-expense-page")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("expense-form")).toBeInTheDocument();
    });
    expect(screen.getByText("Edit Expense")).toBeInTheDocument();
  });
});
