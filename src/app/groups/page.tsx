"use client";
// Implements: TASK-046

import { useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { GroupCreateForm } from "@/components/GroupCreateForm/GroupCreateForm";
import { InviteCodeInput } from "@/components/InviteCodeInput/InviteCodeInput";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { ROUTES } from "@/constants/routes";
import { GroupCardWithData } from "@/app/home/GroupCardWithData";
import { useAuth } from "@/hooks/useAuth";

export default function GroupsPage() {
  const navigate = useNavigate();
  const { groups, isLoading: groupsLoading } = useGroups();
  const { currentUser } = useAuth();

  const handleGroupCreated = (_group: { id: string }, _inviteCode: string) => {
    navigate(ROUTES.GROUP_DETAIL(_group.id));
  };

  const handleJoinSuccess = (groupId: string) => {
    navigate(ROUTES.GROUP_DETAIL(groupId));
  };

  return (
    <AppLayout>
      <div className="space-y-8 px-4 py-6" data-testid="groups-page">
        <h1 className="text-2xl font-bold text-text-primary">Groups</h1>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Create a Group</h2>
          <div className="rounded-xl border border-border bg-white p-4">
            <GroupCreateForm onSuccess={handleGroupCreated} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Join a Group</h2>
          <div className="rounded-xl border border-border bg-white p-4">
            <InviteCodeInput onSuccess={handleJoinSuccess} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-text-primary">Your Groups</h2>
          {groupsLoading ? (
            <div
              className="h-24 animate-pulse rounded-xl bg-surface-muted"
              aria-busy="true"
              aria-label="Loading groups"
            />
          ) : groups.length === 0 ? (
            <EmptyState
              title="No groups yet"
              description="Create or join a group to get started."
              actionLabel="Create Group"
              onAction={() => {}}
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
