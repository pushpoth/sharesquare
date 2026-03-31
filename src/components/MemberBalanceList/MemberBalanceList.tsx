"use client";

import { MemberAvatar } from "@/components/MemberAvatar";
import { formatCurrency } from "@/utils/currency";

export interface MemberBalanceListProps {
  members: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
    balance: number;
  }>;
}

export function MemberBalanceList({ members }: MemberBalanceListProps) {
  const getBalanceText = (balance: number) => {
    if (balance > 0) return `Owed ${formatCurrency(balance)}`;
    if (balance < 0) return `Owes ${formatCurrency(Math.abs(balance))}`;
    return "Owed $0";
  };

  const getBalanceClassName = (balance: number) => {
    if (balance > 0) return "text-accent";
    if (balance < 0) return "text-owing-text";
    return "text-text-secondary";
  };

  return (
    <div className="space-y-2" data-testid="member-balance-list">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
          data-testid={`member-balance-${member.userId}`}
        >
          <MemberAvatar
            name={member.name}
            avatarUrl={member.avatarUrl}
            size="md"
          />
          <span className="min-w-0 flex-1 truncate font-medium">
            {member.name}
          </span>
          <span className={`text-sm font-medium ${getBalanceClassName(member.balance)}`}>
            {getBalanceText(member.balance)}
          </span>
        </div>
      ))}
    </div>
  );
}
