"use client";
// Implements: TASK-042 (REQ-004)

import { useState } from "react";
import { useToast } from "@/components/Toast/Toast";
import { useGroups } from "@/hooks/useGroups";

export interface InviteCodeInputProps {
  onSuccess: (groupId: string) => void;
}

export function InviteCodeInput({ onSuccess }: InviteCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { joinGroup } = useGroups();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const offlineMsg =
        "You appear to be offline. Connect to the internet to join a group.";
      setError(offlineMsg);
      showToast(offlineMsg, "error");
      return;
    }
    try {
      const group = await joinGroup(trimmed);
      onSuccess(group.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join group";
      let display: string;
      if (message.includes("Invalid") || message.includes("not found")) {
        display = "Code not found";
      } else if (message.includes("already a member")) {
        display = "Already a member";
      } else {
        display = message;
      }
      setError(display);
      showToast(display, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="invite-code-input">
      <div>
        <input
          type="text"
          value={code}
          onChange={handleChange}
          placeholder="Enter invite code"
          className="w-full rounded-lg border border-border px-3 py-2 font-mono uppercase"
          autoCapitalize="characters"
          autoComplete="off"
          data-testid="invite-code-field"
        />
        {error && (
          <p className="mt-1 text-sm text-owing-text" role="alert">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={!code.trim()}
        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        data-testid="invite-code-submit"
      >
        Join
      </button>
    </form>
  );
}
