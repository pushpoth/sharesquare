"use client";
// Implements: TASK-033 (REQ-005, REQ-027)

import { Link } from "react-router-dom";
import type { Group } from "@/types";
import { ROUTES } from "@/constants/routes";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/utils/currency";
import { relativeTime } from "@/utils/dateUtils";
import { AvatarGroup } from "@/components/MemberAvatar/MemberAvatar";

export interface GroupCardMember {
  name: string;
  avatarUrl?: string;
}

export interface GroupCardProps {
  group: Group;
  members: GroupCardMember[];
  totalExpenses: number;
  userBalance: number;
  lastActivity?: string;
}

function getGroupEmoji(name: string): string {
  const emojis = ["🏠", "👥", "💰", "🍕", "✈️", "🎉"];
  const index = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return emojis[index % emojis.length];
}

export function GroupCard({
  group,
  members,
  totalExpenses,
  userBalance,
  lastActivity,
}: GroupCardProps) {
  const { currencyCode } = useCurrency();
  const isOwed = userBalance >= 0;

  return (
    <Link
      to={ROUTES.GROUP_DETAIL(group.id)}
      className="block rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      data-testid={`group-card-${group.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              {getGroupEmoji(group.name)}
            </span>
            <h3 className="truncate font-semibold text-text-primary">{group.name}</h3>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <AvatarGroup members={members} max={4} />
            <span className="text-sm text-text-secondary">
              {members.length} Member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            Total Expenses: {formatCurrency(totalExpenses, currencyCode)}
          </p>
          {lastActivity && (
            <p className="mt-1 text-xs text-text-secondary">Active {relativeTime(lastActivity)}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded px-2 py-1 text-xs font-medium text-white ${
              isOwed ? "bg-accent" : "bg-owed-badge"
            }`}
          >
            {isOwed
              ? `YOU ARE OWED ${formatCurrency(userBalance, currencyCode)}`
              : `YOU OWE ${formatCurrency(Math.abs(userBalance), currencyCode)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
