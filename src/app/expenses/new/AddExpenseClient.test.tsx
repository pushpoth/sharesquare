// Implements: TASK-048 (REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-028)

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("dexie-react-hooks", () => {
  const ReactMod = jest.requireActual<typeof import("react")>("react");
  return {
    useLiveQuery: (fn: () => Promise<unknown>, deps: readonly unknown[]) => {
      const [val, setVal] = ReactMod.useState<unknown[]>([]);
      ReactMod.useEffect(() => {
        let on = true;
        void fn().then((r) => {
          if (on) setVal(Array.isArray(r) ? r : []);
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

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: { id: "u1", email: "a@b.com", name: "Alice", avatarUrl: "", createdAt: "2026-01-01T00:00:00Z" },
  }),
}));

jest.mock("@/components/Toast/Toast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock("@/components/ExpenseForm/ExpenseForm", () => ({
  ExpenseForm: () => <div data-testid="expense-form">form</div>,
}));

jest.mock("@/hooks/useGroups", () => {
  const state = {
    groups: [] as Array<{
      id: string;
      name: string;
      inviteCode: string;
      createdBy: string;
      createdAt: string;
    }>,
    isLoading: false,
  };
  return { useGroups: () => state, __groupsState: state };
});

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
  const mockRepos = {
    groups: {
      getMembers: jest.fn().mockResolvedValue([
        { id: "gm1", groupId: "g1", userId: "u1", role: "admin" as const, joinedAt: "2026-01-01T00:00:00Z" },
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
  return { useRepositories: () => mockRepos, __mockRepos: mockRepos };
});

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual<typeof import("react-router-dom")>("react-router-dom");
  const navigate = jest.fn();
  return { ...actual, useNavigate: () => navigate };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports -- post-mock require avoids Jest/ESM hoist issues with the SUT
const AddExpenseClient = require("./AddExpenseClient").default as typeof import("./AddExpenseClient").default;

type MockGroupRow = { id: string; name: string; inviteCode: string; createdBy: string; createdAt: string };

function groupsState() {
  return (jest.requireMock("@/hooks/useGroups") as { __groupsState: { groups: MockGroupRow[]; isLoading: boolean } })
    .__groupsState;
}

function renderAdd(path = "/expenses/new") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/expenses/new" element={<AddExpenseClient />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AddExpenseClient (TASK-048)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    groupsState().groups = [
      {
        id: "g1",
        name: "Weekend Trip",
        inviteCode: "ABCD",
        createdBy: "u1",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];
  });

  it("shows group picker when no groupId query (REQ-028)", () => {
    renderAdd("/expenses/new");
    expect(screen.getByTestId("add-expense-page")).toBeInTheDocument();
    expect(screen.getByLabelText(/select a group/i)).toBeInTheDocument();
    expect(screen.queryByTestId("expense-form")).not.toBeInTheDocument();
  });

  it("pre-selects group from query and shows read-only group + form (shortcut)", async () => {
    renderAdd("/expenses/new?groupId=g1");
    await waitFor(() => {
      expect(screen.getByTestId("add-expense-group-readonly")).toBeInTheDocument();
    });
    expect(screen.getByTestId("add-expense-group-readonly")).toHaveTextContent("Weekend Trip");
    expect(screen.getByTestId("expense-form")).toBeInTheDocument();
    expect(screen.queryByLabelText(/select a group/i)).not.toBeInTheDocument();
  });

  it("opens expense form after choosing a group manually (no query)", async () => {
    const user = userEvent.setup();
    renderAdd("/expenses/new");
    await user.selectOptions(screen.getByLabelText(/select a group/i), "g1");
    await waitFor(() => {
      expect(screen.getByTestId("expense-form")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("add-expense-group-readonly")).not.toBeInTheDocument();
  });
});
