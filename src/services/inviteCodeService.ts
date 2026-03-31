// Implements: TASK-016 (REQ-003, REQ-004)

import type { IGroupRepository } from "@/repositories/interfaces/IGroupRepository";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_ATTEMPTS = 10;

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function generateCode(): string {
  const part1 = Array.from({ length: 4 }, randomChar).join("");
  const part2 = Array.from({ length: 4 }, randomChar).join("");
  return `${part1}-${part2}`;
}

/**
 * Generates a unique 8-char invite code in format XXXX-XXXX.
 * Excludes confusing chars: I, O, 0, 1.
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
 */
export function normalizeCode(input: string): string {
  return input.trim().replace(/\s+/g, "").toUpperCase();
}
