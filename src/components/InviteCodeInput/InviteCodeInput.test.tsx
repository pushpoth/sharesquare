// Implements: TASK-042 (REQ-004)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Group } from "@/types/group";
import { InviteCodeInput } from "./InviteCodeInput";

const showToast = jest.fn();
jest.mock("@/components/Toast/Toast", () => ({
  useToast: () => ({ showToast }),
}));

const mockJoinGroup = jest.fn();
jest.mock("@/hooks/useGroups", () => ({
  useGroups: () => ({
    joinGroup: mockJoinGroup,
  }),
}));

describe("InviteCodeInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  it("joins via joinGroup and calls onSuccess with group id", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const group: Group = {
      id: "g99",
      name: "Squad",
      inviteCode: "ZZZZ-9999",
      createdBy: "u1",
      createdAt: "2026-01-01T00:00:00Z",
    };
    mockJoinGroup.mockResolvedValue(group);

    render(<InviteCodeInput onSuccess={onSuccess} />);

    await user.type(screen.getByTestId("invite-code-field"), "zzzz9999");
    await user.click(screen.getByTestId("invite-code-submit"));

    expect(mockJoinGroup).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith("g99");
  });

  it("does not call joinGroup when offline; shows message and toast", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      configurable: true,
      value: false,
    });

    render(<InviteCodeInput onSuccess={jest.fn()} />);

    await user.type(screen.getByTestId("invite-code-field"), "ABCD-1234");
    await user.click(screen.getByTestId("invite-code-submit"));

    expect(mockJoinGroup).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/offline/i);
    expect(showToast).toHaveBeenCalledWith(
      expect.stringMatching(/offline/i),
      "error",
    );
  });

  it("maps invalid invite to friendly copy and surfaces toast", async () => {
    const user = userEvent.setup();
    mockJoinGroup.mockRejectedValue(new Error("Invalid invite code"));

    render(<InviteCodeInput onSuccess={jest.fn()} />);

    await user.type(screen.getByTestId("invite-code-field"), "BAD");
    await user.click(screen.getByTestId("invite-code-submit"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Code not found");
    expect(showToast).toHaveBeenCalledWith("Code not found", "error");
  });
});
