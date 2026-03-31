import {
  DEFAULT_CURRENCY_CODE,
  isSupportedCurrencyCode,
  SUPPORTED_CURRENCIES,
  usesWholeUnitStorage,
} from "./currency";

describe("currency constants (TASK-059)", () => {
  it("lists eight MVP currencies", () => {
    expect(SUPPORTED_CURRENCIES).toHaveLength(8);
    expect(DEFAULT_CURRENCY_CODE).toBe("USD");
  });

  it("isSupportedCurrencyCode validates codes", () => {
    expect(isSupportedCurrencyCode("USD")).toBe(true);
    expect(isSupportedCurrencyCode("JPY")).toBe(true);
    expect(isSupportedCurrencyCode("XYZ")).toBe(false);
  });

  it("usesWholeUnitStorage is true for JPY only", () => {
    expect(usesWholeUnitStorage("JPY")).toBe(true);
    expect(usesWholeUnitStorage("USD")).toBe(false);
  });
});
