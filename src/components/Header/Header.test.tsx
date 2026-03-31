// Implements: TASK-028 (REQ-005, REQ-027)

import { render, screen } from "@testing-library/react";
import type { AuthContextValue } from "@/contexts/AuthContext";
import type { User } from "@/types/user";
import { Header } from "./Header";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from "@/hooks/useAuth";

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

describe("Header", () => {
  beforeEach(() => {
    jest.mocked(useAuth).mockReturnValue(baseAuth());
  });

  it("has data-testid header", () => {
    render(<Header />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders search control with test id", () => {
    render(<Header />);
    expect(screen.getByTestId("header-search")).toBeInTheDocument();
  });

  it("shows avatar image from currentUser profile URL", () => {
    const user: User = {
      id: "u1",
      email: "a@b.com",
      name: "Alex River",
      avatarUrl: "https://example.com/a.png",
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    jest.mocked(useAuth).mockReturnValue(baseAuth({ currentUser: user, user: user, isAuthenticated: true }));
    render(<Header />);
    const img = screen.getByRole("img", { name: "Alex River" });
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
  });

  it("shows initials from profile name when no avatar URL", () => {
    const user: User = {
      id: "u1",
      email: "a@b.com",
      name: "Sam Pat",
      avatarUrl: "",
      createdAt: "2025-01-01T00:00:00.000Z",
    };
    jest.mocked(useAuth).mockReturnValue(baseAuth({ currentUser: user, user: user, isAuthenticated: true }));
    render(<Header />);
    expect(screen.getByTestId("header-avatar")).toHaveTextContent("SP");
  });
});
