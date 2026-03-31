// Implements: TASK-004 (REQ-023, REQ-024)

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number; // integer cents
  date: string; // ISO 8601 date (YYYY-MM-DD)
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePayer {
  id: string;
  expenseId: string;
  userId: string;
  amount: number; // integer cents
}

export interface ExpenseSplit {
  id: string;
  expenseId: string;
  userId: string;
  amountOwed: number; // integer cents
}
