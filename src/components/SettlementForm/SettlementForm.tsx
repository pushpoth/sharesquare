"use client";

import { useState } from "react";
import { toISODate } from "@/utils/dateUtils";
import { dollarsToCents } from "@/utils/currency";
import { validateRequired, validateAmount } from "@/utils/validation";

export interface SettlementFormProps {
  members: Array<{ userId: string; name: string }>;
  onSubmit: (data: { fromUserId: string; toUserId: string; amount: number; date: string }) => void;
  onCancel: () => void;
}

export function SettlementForm({ members, onSubmit, onCancel }: SettlementFormProps) {
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [date, setDate] = useState(toISODate());

  const amountCents = amountDisplay ? dollarsToCents(parseFloat(amountDisplay) || 0) : 0;
  const fromError = validateRequired(fromUserId, "From");
  const toError = validateRequired(toUserId, "To");
  const amountError =
    amountCents > 0 ? validateAmount(amountCents) : validateRequired(amountDisplay, "Amount");
  const samePersonError =
    fromUserId && toUserId && fromUserId === toUserId
      ? "From and To must be different people"
      : null;

  const isValid =
    !fromError &&
    !toError &&
    !amountError &&
    !samePersonError &&
    fromUserId &&
    toUserId &&
    amountCents > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      fromUserId,
      toUserId,
      amount: amountCents,
      date,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="settlement-form">
      <div>
        <label htmlFor="settlement-from" className="mb-1 block text-sm font-medium">
          From
        </label>
        <select
          id="settlement-from"
          value={fromUserId}
          onChange={(e) => setFromUserId(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
        >
          <option value="">Select payer</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
        {fromError && <p className="mt-1 text-sm text-owing-text">{fromError.message}</p>}
      </div>

      <div>
        <label htmlFor="settlement-to" className="mb-1 block text-sm font-medium">
          To
        </label>
        <select
          id="settlement-to"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
        >
          <option value="">Select recipient</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.name}
            </option>
          ))}
        </select>
        {toError && <p className="mt-1 text-sm text-owing-text">{toError.message}</p>}
      </div>

      {samePersonError && (
        <p className="text-sm text-owing-text" role="alert">
          {samePersonError}
        </p>
      )}

      <div>
        <label htmlFor="settlement-amount" className="mb-1 block text-sm font-medium">
          Amount
        </label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-border bg-surface-muted px-3 text-text-secondary">
            $
          </span>
          <input
            id="settlement-amount"
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
        <label htmlFor="settlement-date" className="mb-1 block text-sm font-medium">
          Date
        </label>
        <input
          id="settlement-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2"
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
        >
          Record Settlement
        </button>
      </div>
    </form>
  );
}
