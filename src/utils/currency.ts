// Implements: TASK-006 (REQ-013, REQ-008, REQ-009)

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format integer cents for display. Defaults to USD; pass an ISO 4217 code for other currencies (REQ-032).
 */
export function formatCurrency(cents: number, currencyCode = "USD"): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
