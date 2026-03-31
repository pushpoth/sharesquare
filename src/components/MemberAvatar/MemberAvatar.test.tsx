// Implements: TASK-031 (REQ-002, REQ-005)

import { act, fireEvent, render, screen } from "@testing-library/react";
import { AvatarGroup, MemberAvatar } from "./MemberAvatar";

describe("MemberAvatar", () => {
  it("shows two-letter initials for two-word names", () => {
    render(<MemberAvatar name="Jane Doe" />);
    expect(screen.getByTestId("member-avatar-Jane-Doe")).toHaveTextContent("JD");
  });

  it("shows up to two letters for single token names", () => {
    render(<MemberAvatar name="Madonna" />);
    expect(screen.getByTestId("member-avatar-Madonna")).toHaveTextContent("MA");
  });

  it("shows question mark for empty name", () => {
    render(<MemberAvatar name="" />);
    expect(screen.getByTestId("member-avatar-")).toHaveTextContent("?");
  });

  it("renders image when avatarUrl is set", () => {
    render(<MemberAvatar name="Pat" avatarUrl="https://example.com/p.png" />);
    expect(screen.getByRole("img", { name: "Pat" })).toHaveAttribute("src", "https://example.com/p.png");
  });

  it("falls back to initials when image fails to load", () => {
    render(<MemberAvatar name="Chris Lee" avatarUrl="https://example.com/broken.png" />);
    const img = screen.getByRole("img", { name: "Chris Lee" });
    act(() => {
      fireEvent.error(img);
    });
    expect(screen.queryByRole("img", { name: "Chris Lee" })).not.toBeInTheDocument();
    expect(screen.getByTestId("member-avatar-Chris-Lee")).toHaveTextContent("CL");
  });
});

describe("AvatarGroup", () => {
  it("renders stacked avatars and overflow count", () => {
    render(
      <AvatarGroup
        members={[
          { name: "A" },
          { name: "B" },
          { name: "C" },
          { name: "D" },
          { name: "E" },
        ]}
        max={4}
      />,
    );
    expect(screen.getByTestId("avatar-group")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });
});
