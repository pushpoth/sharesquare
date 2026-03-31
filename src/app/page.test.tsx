// Implements: TASK-044 (REQ-001, REQ-027)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { AuthContextValue } from "@/contexts/AuthContext";
import LoginPage from "./page";

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

function renderAt(path = "/") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<div data-testid="home-route">Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage (TASK-044)", () => {
  beforeEach(() => {
    jest.mocked(useAuth).mockReturnValue(baseAuth());
  });

  it("renders login shell with data-testid login-page", () => {
    renderAt();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("redirects authenticated users to /home via Navigate", () => {
    jest.mocked(useAuth).mockReturnValue(
      baseAuth({ isAuthenticated: true, isLoading: false }),
    );
    renderAt();
    expect(screen.getByTestId("home-route")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });

  it("shows loading state while auth initializes", () => {
    jest.mocked(useAuth).mockReturnValue(baseAuth({ isLoading: true }));
    renderAt();
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("sign-in-button triggers demo profile sign-in", async () => {
    const user = userEvent.setup();
    const signInWithDemoProfile = jest.fn().mockResolvedValue(undefined);
    jest.mocked(useAuth).mockReturnValue(baseAuth({ signInWithDemoProfile }));

    renderAt();
    await user.click(screen.getByTestId("sign-in-button"));
    expect(signInWithDemoProfile).toHaveBeenCalledWith({
      email: "demo@sharesquare.app",
      name: "Demo User",
      picture: "",
    });
  });

  it("shows Google sign-in when supabaseAuthAvailable", () => {
    jest.mocked(useAuth).mockReturnValue(baseAuth({ supabaseAuthAvailable: true }));
    renderAt();
    expect(screen.getByTestId("sign-in-google-button")).toBeInTheDocument();
  });
});
