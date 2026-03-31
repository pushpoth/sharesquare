"use client";

import { useLiveQuery } from "dexie-react-hooks";
import type { Group } from "@/types";
import { useRepositories } from "@/contexts/RepositoryContext";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalances } from "@/hooks/useBalances";
import { GroupCard } from "@/components/GroupCard/GroupCard";
import { relativeTime } from "@/utils/dateUtils";

interface GroupCardWithDataProps {
  group: Group;
  currentUserId: string;
}

export function GroupCardWithData({ group, currentUserId }: GroupCardWithDataProps) {
  const repos = useRepositories();
  const { expenses } = useExpenses(group.id);
  const { memberBalances } = useBalances(group.id);

  const membersWithUsers = useLiveQuery(async () => {
    const groupMembers = await repos.groups.getMembers(group.id);
    const users = await Promise.all(groupMembers.map((m) => repos.users.findById(m.userId)));
    return groupMembers.map((_, i) => ({
      name: users[i]?.name ?? "Unknown",
      avatarUrl: users[i]?.avatarUrl,
    }));
  }, [group.id, repos.groups, repos.users]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const userBalance = memberBalances.get(currentUserId) ?? 0;
  const lastExpense = expenses[0];
  const lastActivity = lastExpense?.date ?? lastExpense?.createdAt;

  return (
    <GroupCard
      group={group}
      members={membersWithUsers ?? []}
      totalExpenses={totalExpenses}
      userBalance={userBalance}
      lastActivity={lastActivity ? relativeTime(lastActivity) : undefined}
    />
  );
}
