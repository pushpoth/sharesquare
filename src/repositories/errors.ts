// Implements: TASK-008 (REQ-024)

export class NotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor(message?: string) {
    super(message ?? "Resource not found");
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class DuplicateError extends Error {
  readonly code = "DUPLICATE" as const;

  constructor(message?: string) {
    super(message ?? "Duplicate resource");
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }
}

export class ValidationError extends Error {
  readonly code = "VALIDATION" as const;

  constructor(message?: string) {
    super(message ?? "Validation failed");
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
