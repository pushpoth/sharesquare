// Implements: TASK-037 (REQ-006, REQ-007, REQ-008, REQ-009, REQ-010, REQ-028)

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "./ExpenseForm";

const members = [
  { userId: "u1", name: "Alice" },
  { userId: "u2", name: "Bob" },
];

describe("ExpenseForm", () => {
  it("has data-testid on expense-form root", () => {
    render(
      <ExpenseForm groupMembers={members} onSubmit={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(screen.getByTestId("expense-form")).toBeInTheDocument();
  });

  it("disables submit until required fields and valid splits", () => {
    render(
      <ExpenseForm groupMembers={members} onSubmit={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(screen.getByTestId("expense-form-submit")).toBeDisabled();
  });

  it("submits amount in cents with equal group split and matching payer distribution", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <ExpenseForm groupMembers={members} onSubmit={onSubmit} onCancel={jest.fn()} />,
    );

    await user.type(screen.getByTestId("expense-title"), "Dinner");
    await user.clear(screen.getByTestId("expense-amount"));
    await user.type(screen.getByTestId("expense-amount"), "10.00");

    await user.click(screen.getByTestId("expense-form-submit"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.title).toBe("Dinner");
    expect(payload.amount).toBe(1000);
    expect(payload.paidBy).toEqual([
      { userId: "u1", amount: 500 },
      { userId: "u2", amount: 500 },
    ]);
    expect(payload.splits).toEqual([
      { userId: "u1", amountOwed: 500 },
      { userId: "u2", amountOwed: 500 },
    ]);
  });

  it("blocks submit when custom splits do not sum to total", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <ExpenseForm groupMembers={members} onSubmit={onSubmit} onCancel={jest.fn()} />,
    );

    await user.type(screen.getByTestId("expense-title"), "Lunch");
    await user.clear(screen.getByTestId("expense-amount"));
    await user.type(screen.getByTestId("expense-amount"), "10.00");
    await user.click(screen.getByRole("checkbox", { name: /split equally/i }));

    const a1 = screen.getByTestId("split-amount-u1");
    const a2 = screen.getByTestId("split-amount-u2");
    fireEvent.change(a1, { target: { value: "3.00" } });
    fireEvent.change(a2, { target: { value: "3.00" } });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("expense-form-submit")).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("allows submit with valid custom splits after unchecking split equally", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(
      <ExpenseForm groupMembers={members} onSubmit={onSubmit} onCancel={jest.fn()} />,
    );

    await user.type(screen.getByTestId("expense-title"), "Trip");
    await user.clear(screen.getByTestId("expense-amount"));
    await user.type(screen.getByTestId("expense-amount"), "10.00");
    await user.click(screen.getByRole("checkbox", { name: /split equally/i }));

    const a1 = screen.getByTestId("split-amount-u1");
    const a2 = screen.getByTestId("split-amount-u2");
    fireEvent.change(a1, { target: { value: "6.00" } });
    fireEvent.change(a2, { target: { value: "4.00" } });

    await user.click(screen.getByTestId("expense-form-submit"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].splits).toEqual([
      { userId: "u1", amountOwed: 600 },
      { userId: "u2", amountOwed: 400 },
    ]);
  });

  it("calls onCancel when cancel is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(
      <ExpenseForm groupMembers={members} onSubmit={jest.fn()} onCancel={onCancel} />,
    );
    await user.click(screen.getByTestId("expense-form-cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
