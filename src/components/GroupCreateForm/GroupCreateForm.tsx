"use client";

import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import type { Group } from "@/types";
import { validateRequired } from "@/utils/validation";

export interface GroupCreateFormProps {
  onSuccess: (group: Group, inviteCode: string) => void;
}

export function GroupCreateForm({ onSuccess }: GroupCreateFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);

  const { createGroup } = useGroups();

  const nameError = validateRequired(name.trim(), "Group name");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (nameError || !name.trim()) return;
    if (name.length > 100) {
      setError("Group name must be 100 characters or less");
      return;
    }
    try {
      const group = await createGroup(name.trim());
      setCreatedGroup(group);
      setInviteCode(group.inviteCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      setError("Failed to copy invite code");
    }
  };

  if (createdGroup && inviteCode) {
    return (
      <div className="space-y-4" data-testid="group-create-form">
        <p className="text-sm text-text-secondary">
          Group created! Share this invite code with others:
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-lg">
            {inviteCode}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
          >
            Copy
          </button>
        </div>
        <button
          type="button"
          onClick={() => onSuccess(createdGroup, inviteCode)}
          className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="group-create-form">
      <div>
        <label htmlFor="group-name" className="mb-1 block text-sm font-medium">
          Group Name
        </label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Roommates"
          maxLength={100}
          className="w-full rounded-lg border border-border px-3 py-2"
          required
        />
        {nameError && (
          <p className="mt-1 text-sm text-owing-text">{nameError.message}</p>
        )}
        <p className="mt-1 text-xs text-text-secondary">
          {name.length}/100 characters
        </p>
      </div>
      {error && (
        <p className="text-sm text-owing-text" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!!nameError || !name.trim()}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Create Group
      </button>
    </form>
  );
}
