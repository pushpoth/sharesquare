// Implements: TASK-045 (REQ-005, REQ-027)

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./page";

jest.mock("@/layouts/AppLayout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout-stub">{children}</div>
  ),
}));

jest.mock("@/hooks/useGroups", () => ({
  useGroups: () => ({
    groups: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    createGroup: jest.fn(),
    joinGroup: jest.fn(),
    getGroupById: jest.fn(),
    getGroupMembers: jest.fn(),
    updateGroup: jest.fn(),
  }),
}));

jest.mock("@/hooks/useBalances", () => ({
  useOverallBalances: () => ({
    youOwe: 100,
    owedToYou: 200,
    overallBalance: 100,
  }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: { id: "u1", email: "a@b.com", name: "A", avatarUrl: "", createdAt: "" },
    user: null,
    session: null,
    isAuthenticated: true,
    isLoading: false,
    supabaseAuthAvailable: false,
    signInWithGoogle: jest.fn(),
    signInWithDemoProfile: jest.fn(),
    logout: jest.fn(),
    signOut: jest.fn(),
  }),
}));

describe("HomePage (TASK-045)", () => {
  it("exposes dashboard-page test id and balance summary", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.getByTestId("balance-card")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add expense/i })).toHaveAttribute(
      "href",
      "/expenses/new",
    );
  });
});
