// Implements: TASK-009 (REQ-024)

import type { PostgrestError } from "@supabase/supabase-js";
import { DuplicateError, NotFoundError, ValidationError } from "../errors";

/** Map PostgREST / Postgres errors to repository errors where useful. */
export function throwIfError(error: PostgrestError | null): void {
  if (!error) {
    return;
  }
  if (error.code === "23505") {
    throw new DuplicateError(error.message);
  }
  if (error.message?.includes("Expense not found")) {
    throw new NotFoundError(error.message);
  }
  if (error.message?.toLowerCase().includes("not authenticated")) {
    throw new ValidationError(error.message);
  }
  if (error.message?.toLowerCase().includes("forbidden") || error.code === "42501") {
    throw new ValidationError(error.message ?? "Forbidden");
  }
  throw new Error(error.message);
}
