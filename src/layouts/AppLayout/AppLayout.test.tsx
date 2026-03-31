// Implements: TASK-030 (REQ-019, REQ-026)

import type { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { AuthContextValue } from "@/contexts/AuthContext";
import type { User } from "@/types/user";
import { AppLayout } from "./AppLayout";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

function mockUser(): User {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    email: "t@example.com",
    name: "Test User",
    avatarUrl: "",
    createdAt: "2026-01-01T00:00:00Z",
  };
}

function baseAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    currentUser: null,
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    supabaseAuthAvailable: false,
    signInWithGoogle: jest.fn(),
    signInWithDemoProfile: jest.fn(),
    logout: jest.fn(),
    signOut: jest.fn(),
    ...overrides,
  };
}

function renderWithRoutes(ui: ReactElement, initialPath = "/app") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/app" element={ui} />
        <Route path="/" element={<div>Landing page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AppLayout", () => {
  beforeEach(() => {
    jest.mocked(useAuth).mockReturnValue(baseAuth());
  });

  it("shows loading spinner while auth is initializing", () => {
    jest.mocked(useAuth).mockReturnValue(baseAuth({ isLoading: true }));
    renderWithRoutes(
      <AppLayout>
        <p>Child</p>
      </AppLayout>,
    );
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to landing (/)", async () => {
    jest.mocked(useAuth).mockReturnValue(baseAuth({ isAuthenticated: false, isLoading: false }));
    renderWithRoutes(
      <AppLayout>
        <p>Secret</p>
      </AppLayout>,
    );
    await waitFor(() => {
      expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Landing page")).toBeInTheDocument();
  });

  it("renders shell with max-width main when authenticated", () => {
    jest.mocked(useAuth).mockReturnValue(
      baseAuth({
        isAuthenticated: true,
        isLoading: false,
        currentUser: mockUser(),
        user: mockUser(),
      }),
    );
    renderWithRoutes(
      <AppLayout>
        <p>Dashboard content</p>
      </AppLayout>,
    );
    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    const main = screen.getByText("Dashboard content").closest("main");
    expect(main).toHaveClass("max-w-lg");
  });
});
