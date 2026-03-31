// Implements: TASK-047 (REQ-016, REQ-012, REQ-015, REQ-017, REQ-030)

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("dexie-react-hooks", () => {
  const ReactMod = jest.requireActual<typeof import("react")>("react");
  return {
    useLiveQuery: (fn: () => Promise<unknown>, deps: readonly unknown[]) => {
      const [val, setVal] = ReactMod.useState(undefined);
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

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: {
      id: "u1",
      email: "a@b.com",
      name: "Alice",
      avatarUrl: "",
      createdAt: "2026-01-01T00:00:00Z",
    },
  }),
}));

jest.mock("@/hooks/useGroups", () => {
  const stable = {
    getGroupById: jest.fn(),
    updateGroup: jest.fn(),
    getGroupMembers: jest.fn(),
  };
  return { useGroups: () => stable };
});

jest.mock("@/hooks/useExpenses", () => {
  const stable = {
    expenses: [] as unknown[],
    addExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
  };
  return { useExpenses: () => stable };
});

jest.mock("@/hooks/useBalances", () => {
  const stable = {
    memberBalances: new Map<string, number>([["u1", 500]]),
    simplifiedDebts: [] as unknown[],
    isLoading: false,
  };
  return { useBalances: () => stable };
});

jest.mock("@/hooks/useSettlements", () => {
  const stable = {
    settlements: [] as unknown[],
    addSettlement: jest.fn(),
    deleteSettlement: jest.fn(),
  };
  return { useSettlements: () => stable };
});

jest.mock("@/contexts/RepositoryContext", () => {
  const mockRepos = {
    users: {
      findById: jest.fn().mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        name: "Alice",
        avatarUrl: "",
        createdAt: "2026-01-01T00:00:00Z",
      }),
    },
    expenses: {
      getPayers: jest.fn().mockResolvedValue([]),
      getSplits: jest.fn().mockResolvedValue([]),
    },
  };
  return { useRepositories: () => mockRepos };
});

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual<typeof import("react-router-dom")>("react-router-dom");
  const navigate = jest.fn();
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

// Load SUT after mocks so factories never see TDZ from outer `const` (Jest hoisting + ESM import order).
// eslint-disable-next-line @typescript-eslint/no-require-imports -- intentional post-mock require
const GroupDetailClient = require("./GroupDetailClient").default as typeof import("./GroupDetailClient").default;

function groupsMocks() {
  return (jest.requireMock("@/hooks/useGroups") as { useGroups: () => { getGroupById: jest.Mock; getGroupMembers: jest.Mock } }).useGroups();
}

function settlementsMocks() {
  return (jest.requireMock("@/hooks/useSettlements") as { useSettlements: () => { addSettlement: jest.Mock } }).useSettlements();
}

function renderDetail(path = "/groups/g1") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/groups/:id" element={<GroupDetailClient />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("GroupDetailClient (TASK-047)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    groupsMocks().getGroupById.mockResolvedValue({
      id: "g1",
      name: "Weekend Trip",
      inviteCode: "ABCD-1234",
      createdBy: "u1",
      createdAt: "2026-01-01T00:00:00Z",
    });
    groupsMocks().getGroupMembers.mockResolvedValue([
      {
        id: "gm1",
        groupId: "g1",
        userId: "u1",
        role: "admin" as const,
        joinedAt: "2026-01-01T00:00:00Z",
      },
    ]);
    settlementsMocks().addSettlement.mockResolvedValue(undefined);
  });

  it("shows group-detail-page and invite code after load (REQ-030)", async () => {
    renderDetail();
    expect(screen.getByTestId("group-detail-page")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Weekend Trip")).toBeInTheDocument();
    });
    expect(screen.getByTestId("group-invite-code")).toHaveTextContent("ABCD-1234");
    expect(screen.getByTestId("member-balance-list")).toBeInTheDocument();
  });

  it("copies invite code via clipboard API", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    if (navigator.clipboard?.writeText) {
      jest.spyOn(navigator.clipboard, "writeText").mockImplementation(writeText);
    } else {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });
    }
    renderDetail();
    await waitFor(() => screen.getByTestId("group-invite-copy"));
    fireEvent.click(screen.getByTestId("group-invite-copy"));
    expect(writeText).toHaveBeenCalledWith("ABCD-1234");
  });

  it("opens settlement form when Record Settlement is clicked", async () => {
    const user = userEvent.setup();
    renderDetail();
    await waitFor(() => screen.getByText("Weekend Trip"));
    await user.click(screen.getByRole("button", { name: /record settlement/i }));
    expect(screen.getByTestId("settlement-form")).toBeInTheDocument();
  });
});
