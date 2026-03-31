// Implements: TASK-005 (REQ-027, REQ-028)

export interface ExpenseCategory {
  value: string;
  label: string;
  icon: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { value: "food", label: "Food", icon: "🍔" },
  { value: "rent", label: "Rent", icon: "🏠" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "health", label: "Health", icon: "💊" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "other", label: "Other", icon: "📦" },
];

export const CATEGORY_MAP = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c]),
);
