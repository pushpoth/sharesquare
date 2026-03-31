// Implements: TASK-046 (REQ-003, REQ-004, REQ-005)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { Group } from "@/types/group";
import GroupsPage from "./page";

jest.mock("@/layouts/AppLayout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout-stub">{children}</div>
  ),
}));

jest.mock("@/components/GroupCreateForm/GroupCreateForm", () => ({
  GroupCreateForm: ({ onSuccess }: { onSuccess: (g: Group, code: string) => void }) => (
    <button
      type="button"
      data-testid="mock-create-success"
      onClick={() =>
        onSuccess(
          {
            id: "new-g",
            name: "New",
            inviteCode: "ZZZZ-9999",
            createdBy: "u1",
            createdAt: "",
          },
          "ZZZZ-9999",
        )
      }
    >
      Mock create
    </button>
  ),
}));

jest.mock("@/components/InviteCodeInput/InviteCodeInput", () => ({
  InviteCodeInput: ({ onSuccess }: { onSuccess: (id: string) => void }) => (
    <button type="button" data-testid="mock-join-success" onClick={() => onSuccess("joined-g")}>
      Mock join
    </button>
  ),
}));

jest.mock("@/app/home/GroupCardWithData", () => ({
  GroupCardWithData: ({ group }: { group: { id: string; name: string } }) => (
    <div data-testid={`group-card-${group.id}`}>{group.name}</div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual<typeof import("react-router-dom")>("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: { id: "u1", email: "a@b.com", name: "A", avatarUrl: "", createdAt: "" },
  }),
}));

const mockUseGroups = jest.fn();
jest.mock("@/hooks/useGroups", () => ({
  useGroups: () => mockUseGroups(),
}));

describe("GroupsPage (TASK-046)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
    });
  });

  it("exposes groups-page test id", () => {
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("groups-page")).toBeInTheDocument();
  });

  it("lists groups when loaded", () => {
    mockUseGroups.mockReturnValue({
      groups: [
        {
          id: "g1",
          name: "Trip",
          inviteCode: "A",
          createdBy: "u1",
          createdAt: "",
        },
      ],
      isLoading: false,
    });
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("group-card-g1")).toHaveTextContent("Trip");
  });

  it("navigates to group detail after create success", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByTestId("mock-create-success"));
    expect(mockNavigate).toHaveBeenCalledWith("/groups/new-g");
  });

  it("navigates to group detail after join success", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <GroupsPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByTestId("mock-join-success"));
    expect(mockNavigate).toHaveBeenCalledWith("/groups/joined-g");
  });
});
