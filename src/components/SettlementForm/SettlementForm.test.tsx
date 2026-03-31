// Implements: TASK-043 (REQ-015), TASK-059

import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/contexts/CurrencyContext", () => ({
  useCurrency: () => ({ currencyCode: "USD" as const, setCurrencyCode: jest.fn() }),
}));
import userEvent from "@testing-library/user-event";
import { SettlementForm } from "./SettlementForm";

const members = [
  { userId: "u1", name: "Alice" },
  { userId: "u2", name: "Bob" },
];

describe("SettlementForm", () => {
  it("submits cents, from, to, and date when valid", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <SettlementForm members={members} onSubmit={onSubmit} onCancel={jest.fn()} />,
    );

    await user.selectOptions(screen.getByTestId("settlement-from"), "u1");
    await user.selectOptions(screen.getByTestId("settlement-to"), "u2");
    await user.type(screen.getByTestId("settlement-amount"), "12.50");
    fireEvent.change(screen.getByTestId("settlement-date"), {
      target: { value: "2026-02-01" },
    });

    await user.click(screen.getByTestId("settlement-submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      fromUserId: "u1",
      toUserId: "u2",
      amount: 1250,
      date: "2026-02-01",
    });
  });

  it("blocks submit when from and to are the same", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <SettlementForm members={members} onSubmit={onSubmit} onCancel={jest.fn()} />,
    );

    await user.selectOptions(screen.getByTestId("settlement-from"), "u1");
    await user.selectOptions(screen.getByTestId("settlement-to"), "u1");
    await user.type(screen.getByTestId("settlement-amount"), "5.00");

    expect(screen.getByTestId("settlement-submit")).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <SettlementForm members={members} onSubmit={jest.fn()} onCancel={onCancel} />,
    );

    await user.click(screen.getByTestId("settlement-cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
