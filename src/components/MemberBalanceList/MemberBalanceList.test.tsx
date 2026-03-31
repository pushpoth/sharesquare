// Implements: TASK-040 (REQ-016)

import { render, screen } from "@testing-library/react";
import { MemberBalanceList } from "./MemberBalanceList";

describe("MemberBalanceList", () => {
  it("renders list and per-member rows with balance copy", () => {
    render(
      <MemberBalanceList
        members={[
          { userId: "a", name: "Ann", balance: 2500 },
          { userId: "b", name: "Ben", balance: -1000 },
          { userId: "c", name: "Cam", balance: 0 },
        ]}
      />,
    );

    expect(screen.getByTestId("member-balance-list")).toBeInTheDocument();
    expect(screen.getByTestId("member-balance-a")).toBeInTheDocument();
    expect(screen.getByText("Owed $25.00")).toBeInTheDocument();
    expect(screen.getByText("Owes $10.00")).toBeInTheDocument();
    expect(screen.getByText("Owed $0")).toBeInTheDocument();
  });
});
