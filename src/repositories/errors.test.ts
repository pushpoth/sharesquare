// Implements: TASK-008 (REQ-024)
import { DuplicateError, NotFoundError, ValidationError } from "./errors";

describe("repository errors", () => {
  it("NotFoundError has name and default code", () => {
    const e = new NotFoundError();
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("NotFoundError");
    expect(e.code).toBe("NOT_FOUND");
    expect(e.message).toBe("Resource not found");
  });

  it("DuplicateError carries custom message", () => {
    const e = new DuplicateError("already exists");
    expect(e.code).toBe("DUPLICATE");
    expect(e.message).toBe("already exists");
  });

  it("ValidationError extends Error", () => {
    const e = new ValidationError("bad input");
    expect(e.code).toBe("VALIDATION");
    expect(e.message).toBe("bad input");
  });
});
