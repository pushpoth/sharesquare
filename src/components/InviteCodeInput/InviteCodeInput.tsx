"use client";

import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";

export interface InviteCodeInputProps {
  onSuccess: (groupId: string) => void;
}

export function InviteCodeInput({ onSuccess }: InviteCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { joinGroup } = useGroups();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.toUpperCase());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      const group = await joinGroup(trimmed);
      onSuccess(group.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join group";
      if (message.includes("Invalid") || message.includes("not found")) {
        setError("Code not found");
      } else if (message.includes("already a member")) {
        setError("Already a member");
      } else {
        setError(message);
      }
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
      >
        Join
      </button>
    </form>
  );
}
