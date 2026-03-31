// Implements: TASK-015 (REQ-001, REQ-002)

import type { AuthChangeEvent, Session, SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import type { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import type { User } from "@/types/user";

const SESSION_KEY = "sharesquare_user_id";

// ---------------------------------------------------------------------------
// Supabase Auth (no Google JWT decode in-app — Supabase handles OAuth)
// ---------------------------------------------------------------------------

export async function signInWithGoogle(
  supabase: SupabaseClient,
  options?: { redirectTo?: string },
): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirectTo = options?.redirectTo ?? `${origin}/`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) {
    throw error;
  }
}

export async function signInWithMagicLink(
  supabase: SupabaseClient,
  email: string,
  options?: { redirectTo?: string },
): Promise<void> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const emailRedirectTo = options?.redirectTo ?? `${origin}/`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });
  if (error) {
    throw error;
  }
}

export async function signOutSupabase(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSupabaseSession(supabase: SupabaseClient): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export type AuthStateCallback = (event: AuthChangeEvent, session: Session | null) => void;

export function subscribeAuthState(
  supabase: SupabaseClient,
  callback: AuthStateCallback,
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return {
    unsubscribe: () => {
      data.subscription.unsubscribe();
    },
  };
}

/**
 * Upserts `profiles` for the signed-in auth user (display_name / avatar from OAuth metadata).
 */
export async function ensureProfile(supabase: SupabaseClient, authUser: SupabaseAuthUser): Promise<void> {
  const email = authUser.email ?? "";
  const meta = authUser.user_metadata as Record<string, unknown> | undefined;
  const name =
    (typeof meta?.full_name === "string" && meta.full_name) ||
    (typeof meta?.name === "string" && meta.name) ||
    (email ? email.split("@")[0] : "User");
  const avatarUrl =
    (typeof meta?.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta?.picture === "string" && meta.picture) ||
    "";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: authUser.id,
      email: email || null,
      display_name: name,
      avatar_url: avatarUrl || null,
    },
    { onConflict: "id" },
  );
  if (error) {
    throw error;
  }
}

// ---------------------------------------------------------------------------
// IndexedDB / demo path (no Supabase Auth)
// ---------------------------------------------------------------------------

/**
 * Finds user by email or creates a new one (Dexie demo flow).
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

export function getSession(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(SESSION_KEY);
}
