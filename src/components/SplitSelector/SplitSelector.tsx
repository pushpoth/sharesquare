"use client";

import { useState, useCallback, useEffect } from "react";
import { MemberAvatar } from "@/components/MemberAvatar";
import { dollarsToCents, splitEqually as splitEquallyUtil } from "@/utils/currency";
import { validateSplitsSum } from "@/utils/validation";

export interface SplitEntry {
  userId: string;
  amountOwed: number;
}

export interface SplitSelectorProps {
  members: Array<{ userId: string; name: string; avatarUrl?: string }>;
  totalCents: number;
  splits: SplitEntry[];
  onChange: (splits: SplitEntry[]) => void;
  splitEqually: boolean;
  onSplitEquallyChange: (checked: boolean) => void;
  readOnly?: boolean;
}

export function SplitSelector({
  members,
  totalCents,
  splits,
  onChange,
  splitEqually,
  onSplitEquallyChange,
  readOnly = false,
}: SplitSelectorProps) {
  const [percentMode, setPercentMode] = useState<Record<string, boolean>>({});

  const togglePercentMode = useCallback((userId: string) => {
    setPercentMode((prev) => ({ ...prev, [userId]: !prev[userId] }));
  }, []);

  useEffect(() => {
    if (!splitEqually || totalCents <= 0 || members.length === 0) return;
    const equalAmounts = splitEquallyUtil(totalCents, members.length);
    const expectedSplits: SplitEntry[] = members.map((m, i) => ({
      userId: m.userId,
      amountOwed: equalAmounts[i] ?? 0,
    }));
    const isEqual =
      splits.length === expectedSplits.length &&
      expectedSplits.every(
        (e, i) => splits[i]?.userId === e.userId && splits[i]?.amountOwed === e.amountOwed,
      );
    if (!isEqual) {
      onChange(expectedSplits);
    }
  }, [splitEqually, totalCents, members, splits, onChange]);

  const handleAmountChange = useCallback(
    (userId: string, value: string, isPercent: boolean) => {
      if (readOnly) return;
      const num = parseFloat(value) || 0;
      let cents: number;
      if (isPercent) {
        cents = Math.round((totalCents * num) / 100);
      } else {
        cents = dollarsToCents(num);
      }
      const existing = splits.find((s) => s.userId === userId);
      const newSplits = existing
        ? splits.map((s) => (s.userId === userId ? { ...s, amountOwed: cents } : s))
        : [...splits, { userId, amountOwed: cents }];
      onChange(newSplits);
    },
    [splits, totalCents, onChange, readOnly],
  );

  const splitsSumError = validateSplitsSum(splits, totalCents);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={splitEqually}
          onChange={(e) => onSplitEquallyChange(e.target.checked)}
          disabled={readOnly}
          className="rounded border-border"
        />
        <span className="text-sm font-medium">Split Equally</span>
      </label>

      <div className="space-y-2">
        {members.map((member) => {
          const entry = splits.find((s) => s.userId === member.userId);
          const amountOwed = entry?.amountOwed ?? 0;
          const isPercent = percentMode[member.userId] ?? false;
          const displayValue = isPercent
            ? totalCents > 0
              ? ((amountOwed / totalCents) * 100).toFixed(1)
              : "0"
            : (amountOwed / 100).toFixed(2);

          return (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted/50 p-2"
            >
              <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{member.name}</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={displayValue}
                  onChange={(e) => handleAmountChange(member.userId, e.target.value, isPercent)}
                  readOnly={readOnly}
                  className="w-20 rounded border border-border px-2 py-1 text-right text-sm"
                />
                <button
                  type="button"
                  onClick={() => togglePercentMode(member.userId)}
                  disabled={readOnly}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    isPercent
                      ? "bg-accent text-white"
                      : "bg-surface-muted text-text-secondary hover:bg-border"
                  }`}
                >
                  %
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {splitsSumError && (
        <p className="text-sm text-owing-text" role="alert">
          {splitsSumError.message}
        </p>
      )}
    </div>
  );
}
