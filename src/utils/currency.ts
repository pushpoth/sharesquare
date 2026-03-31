// Implements: TASK-006 (REQ-013, REQ-008, REQ-009), TASK-059 (REQ-032)

import { usesWholeUnitStorage } from "@/constants/currency";

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Prefix symbol for amount inputs (e.g. $, ¥) from Intl.
 */
export function getCurrencySymbol(currencyCode: string): string {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? "$";
}

/**
 * Format stored integer for display. USD/EUR/… use cent minor units (value / 100); JPY uses whole yen (REQ-032).
 */
export function formatCurrency(amountStored: number, currencyCode = "USD"): string {
  const whole = usesWholeUnitStorage(currencyCode);
  const numeric = whole ? amountStored : amountStored / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(numeric);
}

/** Parse user-typed amount into stored units (cents or whole yen). */
export function displayInputToStoredAmount(displayValue: number, currencyCode: string): number {
  if (usesWholeUnitStorage(currencyCode)) {
    return Math.round(displayValue);
  }
  return dollarsToCents(displayValue);
}

/** Initial / controlled display string for an existing stored amount. */
export function storedAmountToDisplayInputString(stored: number, currencyCode: string): string {
  if (usesWholeUnitStorage(currencyCode)) {
    return stored === 0 ? "" : String(stored);
  }
  return (stored / 100).toFixed(2);
}

/**
 * Distributes a total amount in cents equally among N members.
 * Handles remainder by distributing extra cents to the first members.
 * Returns an array of amounts in cents.
 */
export function splitEqually(totalCents: number, memberCount: number): number[] {
  if (memberCount <= 0) return [];
  const base = Math.floor(totalCents / memberCount);
  const remainder = totalCents - base * memberCount;
  return Array.from({ length: memberCount }, (_, i) => (i < remainder ? base + 1 : base));
}
