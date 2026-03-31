"use client";
// Implements: TASK-032 (REQ-005, REQ-027)

import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/currency";

export interface BalanceCardProps {
  overallBalance: number;
  youOwe: number;
  owedToYou: number;
}

export function BalanceCard({ overallBalance, youOwe, owedToYou }: BalanceCardProps) {
  const { currencyCode } = useCurrency();
  return (
    <div className="rounded-2xl bg-primary p-6 text-text-on-primary" data-testid="balance-card">
      <p className="mb-1 text-sm opacity-80">Overall Balance</p>
      <p className="text-3xl font-bold">{formatCurrency(overallBalance, currencyCode)}</p>
      <p className="mb-4 text-sm opacity-80">OWED</p>
      <div className="flex items-center gap-4 border-t border-white/20 pt-4">
        <div className="flex-1">
          <p className="text-sm opacity-80">You Owe</p>
          <p className="font-semibold">{formatCurrency(youOwe, currencyCode)}</p>
        </div>
        <div className="h-8 w-px bg-white/30" />
        <div className="flex-1">
          <p className="text-sm opacity-80">Owed to You</p>
          <p className="font-semibold">{formatCurrency(owedToYou, currencyCode)}</p>
        </div>
      </div>
    </div>
  );
}
