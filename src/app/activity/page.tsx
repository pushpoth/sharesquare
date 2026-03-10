"use client";
// Implements: TASK-050

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useAuth } from "@/hooks/useAuth";
import { useRepositories } from "@/contexts/RepositoryContext";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { EmptyState } from "@/components/EmptyState/EmptyState";
import { relativeTime } from "@/utils/dateUtils";
import type { ActivityEntry } from "@/types";

export default function ActivityPage() {
  const { currentUser } = useAuth();
  const repos = useRepositories();

  const activityEntries = useLiveQuery(
    async () => {
      if (!currentUser) return [];
      return repos.activity.getByUserId(currentUser.id, 50);
    },
    [currentUser?.id, repos.activity]
  );

  const entries = activityEntries ?? [];

  return (
    <AppLayout>
      <div className="space-y-6 px-4 py-6" data-testid="activity-page">
        <h1 className="text-2xl font-bold text-text-primary">Activity</h1>

        {entries.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Your expense and settlement activity will appear here."
          />
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <ActivityEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ActivityEntryRow({ entry }: { entry: ActivityEntry }) {
  const [groupName, setGroupName] = useState<string | null>(null);
  const repos = useRepositories();

  useEffect(() => {
    if (entry.groupId) {
      repos.groups.findById(entry.groupId).then((g) => setGroupName(g?.name ?? null));
    }
  }, [entry.groupId, repos.groups]);

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary">{entry.description}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            {relativeTime(entry.timestamp)}
          </span>
          {groupName && (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
              {groupName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
