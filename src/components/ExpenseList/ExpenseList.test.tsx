// Implements: TASK-038 (REQ-016)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types";
import { ExpenseList } from "./ExpenseList";

function expense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: "e1",
    groupId: "g1",
    title: "Coffee",
    amount: 1200,
    date: "2026-03-15",
    category: "food",
    createdBy: "u1",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
    ...overrides,
  };
}

describe("ExpenseList", () => {
  it("renders rows with test ids and formatted amounts", () => {
    const exp = expense();
    const payers = new Map<string, ExpensePayer[]>([
      [
        exp.id,
        [
          {
            id: "p1",
            expenseId: exp.id,
            userId: "u1",
            amount: 1200,
          },
        ],
      ],
    ]);
    const splits = new Map<string, ExpenseSplit[]>([
      [
        exp.id,
        [
          {
            id: "s1",
            expenseId: exp.id,
            userId: "u2",
            amountOwed: 600,
          },
        ],
      ],
    ]);
    const members = new Map([["u1", { name: "Alice" }], ["u2", { name: "Bob" }]]);

    render(
      <ExpenseList
        expenses={[exp]}
        payers={payers}
        splits={splits}
        members={members}
        currentUserId="u2"
      />,
    );

    expect(screen.getByTestId("expense-list")).toBeInTheDocument();
    expect(screen.getByTestId("expense-row-e1")).toBeInTheDocument();
    expect(screen.getByText("Mar 15")).toBeInTheDocument();
    expect(screen.getByText("Paid by Alice ($12.00)")).toBeInTheDocument();
    expect(screen.getAllByText("$12.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$6.00")).toBeInTheDocument();
  });

  it("invokes onEdit when row is clicked", async () => {
    const user = userEvent.setup();
    const exp = expense({ id: "e2" });
    const onEdit = jest.fn();
    render(
      <ExpenseList
        expenses={[exp]}
        payers={new Map()}
        splits={new Map()}
        members={new Map()}
        currentUserId="u1"
        onEdit={onEdit}
      />,
    );
    await user.click(screen.getByTestId("expense-row-e2"));
    expect(onEdit).toHaveBeenCalledWith("e2");
  });

  it("invokes onDelete without triggering onEdit", async () => {
    const user = userEvent.setup();
    const exp = expense({ id: "e3" });
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <ExpenseList
        expenses={[exp]}
        payers={new Map()}
        splits={new Map()}
        members={new Map()}
        currentUserId="u1"
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    await user.click(screen.getByTestId("expense-delete-e3"));
    expect(onDelete).toHaveBeenCalledWith("e3");
    expect(onEdit).not.toHaveBeenCalled();
  });
});
