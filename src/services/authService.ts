// Implements: TASK-015 (REQ-001, REQ-002)

import type { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import type { User } from "@/types/user";

const SESSION_KEY = "sharesquare_user_id";

/**
 * Decodes a Google ID token JWT (base64url-encoded).
 * Extracts email, name, and picture from the payload.
 */
export function decodeGoogleCredential(credential: string): {
  email: string;
  name: string;
  picture: string;
} {
  const parts = credential.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT: missing payload");
  }
  const payloadBase64 = parts[1];
  const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
  const payload = JSON.parse(payloadJson) as Record<string, unknown>;
  const email = payload.email as string;
  const name = payload.name as string;
  const picture = payload.picture as string;
  if (!email || !name || !picture) {
    throw new Error("Invalid JWT payload: missing email, name, or picture");
  }
  return { email, name, picture };
}

/**
 * Finds user by email or creates a new one.
 */
export async function loginOrCreateUser(
  userRepo: IUserRepository,
  profile: { email: string; name: string; picture: string },
): Promise<User> {
  const existing = await userRepo.findByEmail(profile.email);
  if (existing) {
    return existing;
  }
  return userRepo.create({
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
  });
}

/**
 * Reads the current session user ID from localStorage.
 */
export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

/**
 * Writes the user ID to localStorage as the session.
 */
export function setSession(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, userId);
}

/**
 * Removes the session from localStorage.
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
