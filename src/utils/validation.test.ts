import {
  validateRequired,
  validateAmount,
  validateSplitsSum,
  validatePercentagesSum,
} from "./validation";

describe("validateRequired", () => {
  it("returns error for empty values", () => {
    expect(validateRequired("", "Name")).toEqual({ field: "Name", message: "Name is required" });
    expect(validateRequired("  ", "Name")).toEqual({ field: "Name", message: "Name is required" });
    expect(validateRequired(null, "Name")).toEqual({ field: "Name", message: "Name is required" });
    expect(validateRequired(undefined, "Name")).toEqual({
      field: "Name",
      message: "Name is required",
    });
  });

  it("returns null for valid values", () => {
    expect(validateRequired("hello", "Name")).toBeNull();
    expect(validateRequired(0, "Amount")).toBeNull();
    expect(validateRequired(false, "Flag")).toBeNull();
  });
});

describe("validateAmount", () => {
  it("rejects zero and negative", () => {
    expect(validateAmount(0)).not.toBeNull();
    expect(validateAmount(-100)).not.toBeNull();
  });

  it("rejects non-integers", () => {
    expect(validateAmount(10.5)).not.toBeNull();
  });

  it("rejects amounts over max", () => {
    expect(validateAmount(100000000)).not.toBeNull();
  });

  it("accepts valid amounts", () => {
    expect(validateAmount(1)).toBeNull();
    expect(validateAmount(12500)).toBeNull();
    expect(validateAmount(99999999)).toBeNull();
  });
});

describe("validateSplitsSum", () => {
  it("returns null when splits sum to total", () => {
    const splits = [{ amountOwed: 5000 }, { amountOwed: 5000 }];
    expect(validateSplitsSum(splits, 10000)).toBeNull();
  });

  it("returns error when splits don't sum to total", () => {
    const splits = [{ amountOwed: 5000 }, { amountOwed: 3000 }];
    const result = validateSplitsSum(splits, 10000);
    expect(result).not.toBeNull();
    expect(result!.field).toBe("splits");
  });
});

describe("validatePercentagesSum", () => {
  it("returns null when percentages sum to 100", () => {
    expect(validatePercentagesSum([50, 50])).toBeNull();
    expect(validatePercentagesSum([33.33, 33.33, 33.34])).toBeNull();
  });

  it("returns error when percentages don't sum to 100", () => {
    const result = validatePercentagesSum([50, 40]);
    expect(result).not.toBeNull();
    expect(result!.field).toBe("percentages");
  });
});
