// Implements: TASK-016 (REQ-003, REQ-004)

import type { Group } from "@/types/group";
import type { IGroupRepository } from "@/repositories/interfaces/IGroupRepository";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_ATTEMPTS = 10;

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

/** Human-readable invite segment: `XXXX-XXXX` (excludes I, O, 0, 1). */
export function generateCode(): string {
  const part1 = Array.from({ length: 4 }, randomChar).join("");
  const part2 = Array.from({ length: 4 }, randomChar).join("");
  return `${part1}-${part2}`;
}

/**
 * Generates a unique code, retrying on collision with existing groups.
 */
export async function generateUniqueCode(groupRepo: IGroupRepository): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateCode();
    const existing = await groupRepo.findByInviteCode(code);
    if (!existing) {
      return code;
    }
  }
  throw new Error(`Failed to generate unique invite code after ${MAX_ATTEMPTS} attempts`);
}

/**
 * Normalizes invite code input: trim, uppercase, remove spaces.
 * If the result is 8 alphanumeric characters (no hyphen), inserts `XXXX-XXXX` hyphen for lookup.
 */
export function normalizeCode(input: string): string {
  const compact = input.trim().replace(/\s+/g, "").toUpperCase();
  if (/^[A-Z0-9]{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4)}`;
  }
  return compact;
}

/** Resolves a group by normalized invite code (delegates to `IGroupRepository.findByInviteCode`). */
export async function resolveGroupByCode(
  groupRepo: IGroupRepository,
  rawInput: string,
): Promise<Group | undefined> {
  const normalized = normalizeCode(rawInput);
  return groupRepo.findByInviteCode(normalized);
}
