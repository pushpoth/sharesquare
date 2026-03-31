// Implements: TASK-053 (REQ-018)

export interface DebtFlow {
  fromUserId: string;
  toUserId: string;
  amountCents: number;
}
