// Implements: TASK-050 (REQ-020)

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

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

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: { id: "u1", email: "a@b.com", name: "Alice", avatarUrl: "", createdAt: "2026-01-01T00:00:00Z" },
  }),
}));

jest.mock("@/contexts/RepositoryContext", () => {
  const entries = [
    {
      id: "a1",
      userId: "u1",
      groupId: "g1",
      type: "expense_added" as const,
      description: "You added Lunch",
      referenceId: "e1",
      timestamp: "2026-01-01T12:00:00.000Z",
    },
  ];
  const mockRepos = {
    activity: {
      getByUserId: jest.fn().mockResolvedValue(entries),
    },
    groups: {
      findById: jest.fn().mockResolvedValue({
        id: "g1",
        name: "Trip",
        inviteCode: "X",
        createdBy: "u1",
        createdAt: "2026-01-01T00:00:00Z",
      }),
    },
  };
  return { useRepositories: () => mockRepos, __mockRepos: mockRepos };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ActivityPage = require("./page").default as typeof import("./page").default;

describe("ActivityPage (TASK-050)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows activity-page test id and empty state when there is no activity", async () => {
    const mod = jest.requireMock("@/contexts/RepositoryContext") as {
      __mockRepos: { activity: { getByUserId: jest.Mock } };
    };
    mod.__mockRepos.activity.getByUserId.mockResolvedValueOnce([]);
    render(<ActivityPage />);
    expect(screen.getByTestId("activity-page")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
    });
  });

  it("lists activity entries with group label when data exists", async () => {
    render(<ActivityPage />);
    await waitFor(() => {
      expect(screen.getByTestId("activity-entry")).toBeInTheDocument();
    });
    expect(screen.getByText("You added Lunch")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Trip")).toBeInTheDocument();
    });
  });
});
