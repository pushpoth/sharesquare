// Implements: TASK-006 (REQ-013, REQ-008, REQ-009)

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(Math.abs(cents));
  const formatted = `$${dollars.toFixed(2)}`;
  return cents < 0 ? `-${formatted}` : formatted;
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
