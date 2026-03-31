import {
  centsToDollars,
  displayInputToStoredAmount,
  dollarsToCents,
  formatCurrency,
  splitEqually,
  storedAmountToDisplayInputString,
} from "./currency";

describe("centsToDollars", () => {
  it("converts cents to dollars", () => {
    expect(centsToDollars(12500)).toBe(125.0);
    expect(centsToDollars(0)).toBe(0);
    expect(centsToDollars(1)).toBe(0.01);
    expect(centsToDollars(99999999)).toBe(999999.99);
  });
});

describe("dollarsToCents", () => {
  it("converts dollars to cents", () => {
    expect(dollarsToCents(125.0)).toBe(12500);
    expect(dollarsToCents(0)).toBe(0);
    expect(dollarsToCents(0.01)).toBe(1);
  });

  it("rounds to nearest cent", () => {
    expect(dollarsToCents(10.005)).toBe(1001);
    expect(dollarsToCents(10.004)).toBe(1000);
  });
});

describe("formatCurrency", () => {
  it("formats cents as dollar string", () => {
    expect(formatCurrency(12500)).toBe("$125.00");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(1)).toBe("$0.01");
    expect(formatCurrency(100)).toBe("$1.00");
  });

  it("handles negative amounts", () => {
    expect(formatCurrency(-12500)).toBe("-$125.00");
    expect(formatCurrency(-1)).toBe("-$0.01");
  });

  it("formats with a non-default ISO currency code", () => {
    expect(formatCurrency(12500, "EUR")).toMatch(/125[.,]00/);
    expect(formatCurrency(12500, "EUR")).toContain("€");
  });

  it("JPY uses whole-yen storage: no decimals", () => {
    expect(formatCurrency(1250, "JPY")).toBe("¥1,250");
    expect(formatCurrency(0, "JPY")).toBe("¥0");
  });
});

describe("displayInputToStoredAmount / storedAmountToDisplayInputString (TASK-059)", () => {
  it("maps major units to cents for USD", () => {
    expect(displayInputToStoredAmount(10.5, "USD")).toBe(1050);
    expect(storedAmountToDisplayInputString(1050, "USD")).toBe("10.50");
  });

  it("maps whole units for JPY", () => {
    expect(displayInputToStoredAmount(1250, "JPY")).toBe(1250);
    expect(storedAmountToDisplayInputString(1250, "JPY")).toBe("1250");
  });
});

describe("splitEqually", () => {
  it("splits evenly when divisible", () => {
    expect(splitEqually(10000, 4)).toEqual([2500, 2500, 2500, 2500]);
    expect(splitEqually(300, 3)).toEqual([100, 100, 100]);
  });

  it("distributes remainder to first members", () => {
    expect(splitEqually(10000, 3)).toEqual([3334, 3333, 3333]);
    expect(splitEqually(100, 3)).toEqual([34, 33, 33]);
    expect(splitEqually(1, 3)).toEqual([1, 0, 0]);
  });

  it("handles single member", () => {
    expect(splitEqually(10000, 1)).toEqual([10000]);
  });

  it("handles zero members", () => {
    expect(splitEqually(10000, 0)).toEqual([]);
  });

  it("preserves total amount", () => {
    const splits = splitEqually(10001, 7);
    expect(splits.reduce((a, b) => a + b, 0)).toBe(10001);
  });
});
