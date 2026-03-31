"use client";

import type { Expense, ExpensePayer, ExpenseSplit } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currency";

export interface ExpenseListProps {
  expenses: Expense[];
  payers: Map<string, ExpensePayer[]>;
  splits: Map<string, ExpenseSplit[]>;
  members: Map<string, { name: string }>;
  currentUserId: string;
  onEdit?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
}

export function ExpenseList({
  expenses,
  payers,
  splits,
  members,
  currentUserId,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  const getPayerDescription = (expenseId: string): string => {
    const expensePayers = payers.get(expenseId);
    if (!expensePayers || expensePayers.length === 0) return "Unknown";
    const total = expensePayers.reduce((sum, p) => sum + p.amount, 0);
    if (expensePayers.length === 1) {
      const name = members.get(expensePayers[0].userId)?.name ?? "Unknown";
      return `Paid by ${name} (${formatCurrency(total)})`;
    }
    const names = expensePayers.map((p) => members.get(p.userId)?.name ?? "Unknown").join(", ");
    return `Paid by ${names} (${formatCurrency(total)})`;
  };

  const getCurrentUserShare = (expenseId: string): string => {
    const expenseSplits = splits.get(expenseId);
    const mySplit = expenseSplits?.find((s) => s.userId === currentUserId);
    return mySplit ? formatCurrency(mySplit.amountOwed) : formatCurrency(0);
  };

  return (
    <section data-testid="expense-list">
      <h2 className="mb-3 text-lg font-semibold">Recent Expenses</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[400px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="px-3 py-2 text-left text-sm font-medium">Date</th>
              <th className="px-3 py-2 text-left text-sm font-medium">Payer</th>
              <th className="px-3 py-2 text-right text-sm font-medium">Total</th>
              <th className="px-3 py-2 text-right text-sm font-medium">Your Share</th>
              {onDelete && <th className="w-10 px-2 py-2" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                onClick={() => onEdit?.(expense.id)}
                className={`cursor-pointer border-b border-border last:border-b-0 hover:bg-surface-muted/50 ${
                  onEdit ? "" : "cursor-default"
                }`}
              >
                <td className="px-3 py-2 text-sm text-text-secondary">
                  {formatDate(expense.date)}
                </td>
                <td className="px-3 py-2 text-sm">{getPayerDescription(expense.id)}</td>
                <td className="px-3 py-2 text-right text-sm font-medium">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-3 py-2 text-right text-sm">{getCurrentUserShare(expense.id)}</td>
                {onDelete && (
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(expense.id);
                      }}
                      aria-label={`Delete ${expense.title}`}
                      className="rounded p-1 text-owing-text hover:bg-owing-text/10"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
