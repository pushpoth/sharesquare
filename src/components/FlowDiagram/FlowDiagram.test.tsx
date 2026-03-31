// Implements: TASK-053 (REQ-018)

import { render, screen } from "@testing-library/react";
import { FlowDiagram } from "./FlowDiagram";

describe("FlowDiagram", () => {
  const resolveName = (id: string) => (id === "u1" ? "Alice" : "Bob");

  it("shows empty state when no flows", () => {
    render(<FlowDiagram flows={[]} resolveName={resolveName} />);
    expect(screen.getByTestId("flow-diagram-empty")).toBeInTheDocument();
  });

  it("renders a row per flow with names", () => {
    render(
      <FlowDiagram
        flows={[{ fromUserId: "u1", toUserId: "u2", amountCents: 500 }]}
        resolveName={resolveName}
      />,
    );
    expect(screen.getByTestId("flow-diagram")).toBeInTheDocument();
    expect(screen.getByTestId("flow-diagram-row")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
