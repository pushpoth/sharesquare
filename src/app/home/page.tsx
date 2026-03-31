"use client";
// Implements: TASK-045

import { Link } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useOverallBalances } from "@/hooks/useBalances";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { BalanceCard } from "@/components/BalanceCard/BalanceCard";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ROUTES } from "@/constants/routes";
import { GroupCardWithData } from "./GroupCardWithData";

export default function HomePage() {
  const { groups } = useGroups();
  const { youOwe, owedToYou, overallBalance } = useOverallBalances();
  const { currentUser } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6 px-4 py-6" data-testid="dashboard-page">
        <h1 className="text-2xl font-bold text-text-primary">Home</h1>

        <BalanceCard overallBalance={overallBalance} youOwe={youOwe} owedToYou={owedToYou} />

        <Link
          to={ROUTES.ADD_EXPENSE}
          className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Add expense"
        >
          +
        </Link>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Recent Groups</h2>
          {groups.length === 0 ? (
            <EmptyState
              title="No groups yet"
              description="Create one to get started!"
              actionLabel="Create Group"
              onAction={() => (window.location.href = ROUTES.GROUPS)}
            />
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <GroupCardWithData
                  key={group.id}
                  group={group}
                  currentUserId={currentUser?.id ?? ""}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
