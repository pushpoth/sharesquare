// Implements: TASK-032 (REQ-005, REQ-027)

import { render, screen } from "@testing-library/react";
import { formatCurrency } from "@/utils/currency";
import { BalanceCard } from "./BalanceCard";

describe("BalanceCard", () => {
  it("formats cent amounts with formatCurrency", () => {
    const overall = 5025;
    const owe = 1000;
    const owed = 250;
    render(<BalanceCard overallBalance={overall} youOwe={owe} owedToYou={owed} />);
    expect(screen.getByTestId("balance-card")).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(overall))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(owe))).toBeInTheDocument();
    expect(screen.getByText(formatCurrency(owed))).toBeInTheDocument();
  });
});
