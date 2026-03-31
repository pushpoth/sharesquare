// Implements: TASK-059 (REQ-032)

/** Persisted display currency (no FX; see requirements REQ-032). */
export const CURRENCY_STORAGE_KEY = "sharesquare_display_currency";

export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "USD ($)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
  { code: "INR", label: "INR (₹)" },
  { code: "AUD", label: "AUD (A$)" },
  { code: "CAD", label: "CAD (C$)" },
  { code: "JPY", label: "JPY (¥)" },
  { code: "SGD", label: "SGD (S$)" },
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY_CODE: SupportedCurrencyCode = "USD";

export function isSupportedCurrencyCode(code: string): code is SupportedCurrencyCode {
  return SUPPORTED_CURRENCIES.some((c) => c.code === code);
}

/** JPY amounts are stored as whole yen, not hundredths (REQ-032). */
export function usesWholeUnitStorage(currencyCode: string): boolean {
  return currencyCode === "JPY";
}
