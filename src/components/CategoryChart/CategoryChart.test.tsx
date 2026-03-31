// Implements: TASK-053 (REQ-018)

import { render, screen } from "@testing-library/react";
import { CategoryChart } from "./CategoryChart";

describe("CategoryChart", () => {
  it("shows empty state when no segments", () => {
    render(<CategoryChart segments={[]} />);
    expect(screen.getByTestId("category-chart-empty")).toBeInTheDocument();
  });

  it("shows empty state when all amounts are zero", () => {
    render(
      <CategoryChart
        segments={[
          { categoryKey: "food", label: "Food", amountCents: 0 },
        ]}
      />,
    );
    expect(screen.getByTestId("category-chart-empty")).toBeInTheDocument();
  });

  it("renders SVG segments for one category", () => {
    render(
      <CategoryChart
        segments={[{ categoryKey: "food", label: "Food", amountCents: 1000 }]}
      />,
    );
    expect(screen.getByTestId("category-chart")).toBeInTheDocument();
    expect(screen.getByTestId("category-chart-segment-food")).toBeInTheDocument();
  });

  it("renders multiple segments", () => {
    render(
      <CategoryChart
        segments={[
          { categoryKey: "food", label: "Food", amountCents: 600 },
          { categoryKey: "rent", label: "Rent", amountCents: 400 },
        ]}
      />,
    );
    expect(screen.getByTestId("category-chart-segment-food")).toBeInTheDocument();
    expect(screen.getByTestId("category-chart-segment-rent")).toBeInTheDocument();
  });
});
