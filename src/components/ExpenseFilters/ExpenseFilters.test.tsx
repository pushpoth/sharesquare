// Implements: TASK-039 (REQ-017)

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseFilters } from "./ExpenseFilters";

describe("ExpenseFilters", () => {
  it("notifies parent when category and sort change", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();
    render(
      <ExpenseFilters onFilterChange={onFilterChange} categories={["food", "rent"]} />,
    );

    expect(screen.getByTestId("expense-filters")).toBeInTheDocument();

    await user.click(screen.getByTestId("expense-filter-category-food"));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      categories: ["food"],
      sort: "date-desc",
    });

    await user.click(screen.getByTestId("expense-filter-sort-amount-asc"));
    expect(onFilterChange).toHaveBeenLastCalledWith({
      categories: ["food"],
      sort: "amount-asc",
    });
  });

  it("clear resets categories and sort", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();
    render(
      <ExpenseFilters onFilterChange={onFilterChange} categories={["food"]} />,
    );

    await user.click(screen.getByTestId("expense-filter-category-food"));
    await user.click(screen.getByTestId("expense-filter-sort-date-asc"));
    onFilterChange.mockClear();

    await user.click(screen.getByTestId("expense-filter-clear"));
    expect(onFilterChange).toHaveBeenCalledWith({ categories: [], sort: "date-desc" });
  });
});
