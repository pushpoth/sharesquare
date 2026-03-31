"use client";

import { useState, useCallback } from "react";
import { EXPENSE_CATEGORIES } from "@/constants/categories";
import { toISODate } from "@/utils/dateUtils";
import { dollarsToCents } from "@/utils/currency";
import { validateRequired, validateAmount, validateSplitsSum } from "@/utils/validation";
import { SplitSelector } from "@/components/SplitSelector";

const GROUP_PAYER_ID = "__group__";

export interface ExpenseFormProps {
  groupMembers: Array<{ userId: string; name: string; avatarUrl?: string }>;
  initialData?: {
    title: string;
    date: string;
    amount: number;
    category: string;
    payerId: string;
    splits: Array<{ userId: string; amountOwed: number }>;
  };
  onSubmit: (data: {
    title: string;
    date: string;
    amount: number;
    category: string;
    paidBy: Array<{ userId: string; amount: number }>;
    splits: Array<{ userId: string; amountOwed: number }>;
  }) => void;
  onCancel: () => void;
}

export function ExpenseForm({ groupMembers, initialData, onSubmit, onCancel }: ExpenseFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [date, setDate] = useState(initialData?.date ?? toISODate());
  const [amountDisplay, setAmountDisplay] = useState(
    initialData ? (initialData.amount / 100).toFixed(2) : "",
  );
  const [category, setCategory] = useState(initialData?.category ?? "other");
  const [payerId, setPayerId] = useState(initialData?.payerId ?? GROUP_PAYER_ID);
  const [splitEqually, setSplitEqually] = useState(true);
  const [splits, setSplits] = useState<Array<{ userId: string; amountOwed: number }>>(
    () => initialData?.splits ?? groupMembers.map((m) => ({ userId: m.userId, amountOwed: 0 })),
  );

  const amountCents = amountDisplay ? dollarsToCents(parseFloat(amountDisplay) || 0) : 0;

  const titleError = validateRequired(title, "Description");
  const amountError = !amountDisplay.trim()
    ? validateRequired(amountDisplay, "Amount")
    : validateAmount(amountCents);
  const splitsError = amountCents > 0 ? validateSplitsSum(splits, amountCents) : null;

  const isValid =
    !titleError && !amountError && !splitsError && title.trim() !== "" && amountCents > 0;

  const getPaidBy = useCallback((): Array<{ userId: string; amount: number }> => {
    if (payerId === GROUP_PAYER_ID && groupMembers.length > 0) {
      const perPerson = Math.floor(amountCents / groupMembers.length);
      const remainder = amountCents - perPerson * groupMembers.length;
      return groupMembers.map((m, i) => ({
        userId: m.userId,
        amount: perPerson + (i < remainder ? 1 : 0),
      }));
    }
    if (payerId && payerId !== GROUP_PAYER_ID) {
      return [{ userId: payerId, amount: amountCents }];
    }
    return [];
  }, [payerId, amountCents, groupMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      title: title.trim(),
      date,
      amount: amountCents,
      category,
      paidBy: getPaidBy(),
      splits,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="expense-form">
      <div>
        <label htmlFor="expense-title" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <input
          id="expense-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Dinner at Joe's"
          className="w-full rounded-lg border border-border px-3 py-2"
          required
        />
        {titleError && <p className="mt-1 text-sm text-owing-text">{titleError.message}</p>}
      </div>

      <div>
        <label htmlFor="expense-date" className="mb-1 block text-sm font-medium">
          Date
        </label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="expense-amount" className="mb-1 block text-sm font-medium">
          Amount
        </label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-border bg-surface-muted px-3 text-text-secondary">
            $
          </span>
          <input
            id="expense-amount"
            type="text"
            inputMode="decimal"
            value={amountDisplay}
            onChange={(e) => setAmountDisplay(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-r-lg border border-border px-3 py-2"
          />
        </div>
        {amountError && <p className="mt-1 text-sm text-owing-text">{amountError.message}</p>}
      </div>

      <div>
        <label htmlFor="expense-category" className="mb-1 block text-sm font-medium">
          Category
        </label>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="expense-payer" className="mb-1 block text-sm font-medium">
          Who Paid
        </label>
        <select
          id="expense-payer"
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
        >
          <option value={GROUP_PAYER_ID}>Group</option>
          {groupMembers.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">Split</h3>
        <SplitSelector
          members={groupMembers}
          totalCents={amountCents}
          splits={splits}
          onChange={setSplits}
          splitEqually={splitEqually}
          onSplitEquallyChange={setSplitEqually}
          readOnly={splitEqually}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          data-testid="expense-form-submit"
        >
          Save Expense
        </button>
      </div>
    </form>
  );
}
