"use client";
// Implements: TASK-028

import { useAuth } from "@/hooks/useAuth";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export function Header() {
  const { currentUser } = useAuth();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex h-14 w-full items-center justify-between bg-primary-dark px-4"
      data-testid="header"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-accent">
          <span className="text-lg font-bold text-white">S</span>
        </div>
        <span className="text-lg font-semibold text-white">ShareSquare</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Search"
          className="rounded p-1 text-white/80 hover:text-white"
        >
          <SearchIcon />
        </button>
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-primary-light bg-accent/20">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-accent">
              {currentUser ? getInitials(currentUser.name) : "?"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
