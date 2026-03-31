// Implements: TASK-006 (REQ-023)

export function generateId(): string {
  return crypto.randomUUID();
}
