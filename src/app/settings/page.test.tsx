// Implements: TASK-051 (REQ-002, REQ-021, REQ-022)

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import SettingsPage from "./page";

jest.mock("@/layouts/AppLayout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout-stub">{children}</div>
  ),
}));

jest.mock("@/components/MemberAvatar/MemberAvatar", () => ({
  MemberAvatar: () => <div data-testid="member-avatar-stub" />,
}));

jest.mock("@/services/exportService", () => ({
  exportAllData: jest.fn().mockResolvedValue({ version: 1, exportedAt: "", userId: "u1", data: {} }),
  downloadJson: jest.fn(),
  generateExportFilename: jest.fn(() => "export.json"),
}));

jest.mock("@/services/importService", () => ({
  validateImportJson: jest.fn().mockReturnValue({ valid: true, data: { version: 1, userId: "u1", data: {} } }),
  importData: jest.fn().mockResolvedValue({ imported: 0, skipped: 0 }),
  createDexieImportWriter: jest.fn(() => ({})),
}));

jest.mock("@/repositories", () => ({
  repositories: {},
}));

jest.mock("@/repositories/indexeddb/database", () => ({
  db: {},
}));

jest.mock("@/components/Toast/Toast", () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual<typeof import("react-router-dom")>("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockLogout = jest.fn().mockResolvedValue(undefined);
const mockUseAuth = jest.fn(() => ({
  currentUser: {
    id: "u1",
    email: "a@b.com",
    name: "Alice",
    avatarUrl: "",
    createdAt: "2026-01-01T00:00:00Z",
  },
  logout: mockLogout,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("SettingsPage (TASK-051)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      currentUser: {
        id: "u1",
        email: "a@b.com",
        name: "Alice",
        avatarUrl: "",
        createdAt: "2026-01-01T00:00:00Z",
      },
      logout: mockLogout,
    });
  });

  it("exposes settings-page test id", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("settings-page")).toBeInTheDocument();
  });

  it("sign out awaits logout then navigates to landing with replace", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByTestId("settings-sign-out"));
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LANDING, { replace: true });
  });
});
