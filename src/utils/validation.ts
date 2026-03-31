// Implements: TASK-006 (REQ-008, REQ-009)

/** UUID-shaped string (8-4-4-4-12 hex); does not validate version/variant bits. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True if `s` is a canonical UUID string (v1–v8 variant bits accepted). */
export function isValidUuid(s: string): boolean {
  return UUID_RE.test(s.trim());
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequired(value: unknown, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}

export function validateAmount(cents: number): ValidationError | null {
  if (!Number.isInteger(cents)) {
    return { field: "amount", message: "Amount must be a whole number of cents" };
  }
  if (cents <= 0) {
    return { field: "amount", message: "Amount must be greater than zero" };
  }
  if (cents > 99999999) {
    return { field: "amount", message: "Amount cannot exceed $999,999.99" };
  }
  return null;
}

export function validateSplitsSum(
  splits: { amountOwed: number }[],
  totalCents: number,
): ValidationError | null {
  const sum = splits.reduce((acc, s) => acc + s.amountOwed, 0);
  if (sum !== totalCents) {
    const diff = totalCents - sum;
    return {
      field: "splits",
      message: `Split amounts must equal ${formatCentsForError(totalCents)} (off by ${formatCentsForError(Math.abs(diff))})`,
    };
  }
  return null;
}

export function validatePercentagesSum(percentages: number[]): ValidationError | null {
  const sum = percentages.reduce((acc, p) => acc + p, 0);
  if (Math.abs(sum - 100) > 0.01) {
    return {
      field: "percentages",
      message: `Percentages must sum to 100% (currently ${sum.toFixed(1)}%)`,
    };
  }
  return null;
}

function formatCentsForError(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
