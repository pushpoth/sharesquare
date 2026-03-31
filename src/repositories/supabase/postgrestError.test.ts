// Implements: TASK-009 (REQ-024)

import { DuplicateError, NotFoundError, ValidationError } from "../errors";
import { throwIfError } from "./postgrestError";

describe("throwIfError", () => {
  it("no-ops when error is null", () => {
    expect(() => throwIfError(null)).not.toThrow();
  });

  it("maps 23505 to DuplicateError", () => {
    expect(() =>
      throwIfError({ code: "23505", message: "dup", details: "", hint: "" }),
    ).toThrow(DuplicateError);
  });

  it("maps Expense not found message to NotFoundError", () => {
    expect(() =>
      throwIfError({ code: "P0001", message: "Expense not found", details: "", hint: "" }),
    ).toThrow(NotFoundError);
  });

  it("maps Not authenticated to ValidationError", () => {
    expect(() =>
      throwIfError({ code: "XX", message: "Not authenticated", details: "", hint: "" }),
    ).toThrow(ValidationError);
  });

  it("maps Forbidden message to ValidationError", () => {
    expect(() =>
      throwIfError({ code: "XX", message: "Forbidden", details: "", hint: "" }),
    ).toThrow(ValidationError);
  });

  it("rethrows generic PostgREST errors as Error", () => {
    expect(() =>
      throwIfError({ code: "XX", message: "other", details: "", hint: "" }),
    ).toThrow("other");
  });
});
