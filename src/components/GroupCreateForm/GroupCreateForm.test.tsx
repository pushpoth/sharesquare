// Implements: TASK-041 (REQ-003)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Group } from "@/types/group";
import { GroupCreateForm } from "./GroupCreateForm";

const showToast = jest.fn();
jest.mock("@/components/Toast/Toast", () => ({
  useToast: () => ({ showToast }),
}));

const mockCreateGroup = jest.fn();
jest.mock("@/hooks/useGroups", () => ({
  useGroups: () => ({
    createGroup: mockCreateGroup,
  }),
}));

function sampleGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: "g1",
    name: "Roomies",
    inviteCode: "ABCD-1234",
    createdBy: "u1",
    createdAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("GroupCreateForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a group via createGroup and shows invite code", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    mockCreateGroup.mockResolvedValue(sampleGroup());

    render(<GroupCreateForm onSuccess={onSuccess} />);

    await user.type(screen.getByTestId("group-create-name"), "Roomies");
    await user.click(screen.getByTestId("group-create-submit"));

    expect(mockCreateGroup).toHaveBeenCalledWith("Roomies");
    expect(await screen.findByText("ABCD-1234")).toBeInTheDocument();

    await user.click(screen.getByTestId("group-create-done"));
    expect(onSuccess).toHaveBeenCalledWith(sampleGroup(), "ABCD-1234");
  });

  it("shows inline error and toast when createGroup fails", async () => {
    const user = userEvent.setup();
    mockCreateGroup.mockRejectedValue(new Error("Network request failed"));

    render(<GroupCreateForm onSuccess={jest.fn()} />);

    await user.type(screen.getByTestId("group-create-name"), "Trip");
    await user.click(screen.getByTestId("group-create-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Network request failed");
    expect(showToast).toHaveBeenCalledWith("Network request failed", "error");
  });
});
