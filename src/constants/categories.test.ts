import { EXPENSE_CATEGORIES, CATEGORY_MAP } from "./categories";

describe("EXPENSE_CATEGORIES", () => {
  it("contains exactly 9 categories", () => {
    expect(EXPENSE_CATEGORIES).toHaveLength(9);
  });

  it("each category has value, label, and icon", () => {
    EXPENSE_CATEGORIES.forEach((cat) => {
      expect(cat.value).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
    });
  });

  it('includes "other" as the last category', () => {
    expect(EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1].value).toBe("other");
  });
});

describe("CATEGORY_MAP", () => {
  it("maps values to category objects", () => {
    expect(CATEGORY_MAP["food"]).toEqual(expect.objectContaining({ value: "food", label: "Food" }));
    expect(CATEGORY_MAP["rent"]).toEqual(expect.objectContaining({ value: "rent", label: "Rent" }));
  });
});
