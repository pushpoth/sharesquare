// Implements: TASK-034 (REQ-005, REQ-016)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Nothing here" description="Add something to start." />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument();
    expect(screen.getByText("Add something to start.")).toBeInTheDocument();
  });

  it("renders action and calls onAction", async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(
      <EmptyState
        title="T"
        description="D"
        actionLabel="Create"
        onAction={onAction}
      />,
    );
    await user.click(screen.getByTestId("empty-state-action"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
