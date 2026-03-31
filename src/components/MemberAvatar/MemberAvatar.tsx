"use client";
// Implements: TASK-031

import { useState } from "react";

export type AvatarSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 24,
  md: 32,
  lg: 48,
};

export interface MemberAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: AvatarSize;
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

export function MemberAvatar({ name, avatarUrl, size = "md" }: MemberAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimension = SIZE_MAP[size];
  const showImage = avatarUrl && !imageError;

  return (
    <div
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary-light"
      style={{ width: dimension, height: dimension }}
      data-testid={`member-avatar-${name.replace(/\s/g, "-")}`}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-accent/20 text-accent"
          style={{ fontSize: dimension * 0.5 }}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

export interface AvatarGroupMember {
  name: string;
  avatarUrl?: string;
}

export interface AvatarGroupProps {
  members: AvatarGroupMember[];
  max?: number;
}

export function AvatarGroup({ members, max = 4 }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflowCount = members.length - max;

  return (
    <div className="flex items-center">
      {visible.map((member, index) => (
        <div
          key={member.name + index}
          className="-ml-2 first:ml-0"
          style={{ zIndex: visible.length - index }}
        >
          <MemberAvatar
            name={member.name}
            avatarUrl={member.avatarUrl}
            size="sm"
          />
        </div>
      ))}
      {overflowCount > 0 && (
        <div
          className="-ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-medium text-text-primary"
          style={{ zIndex: 0 }}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}
