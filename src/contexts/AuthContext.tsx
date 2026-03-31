"use client";
// Implements: TASK-015, TASK-022 (REQ-001, REQ-002)

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User } from "@/types";
import { repositories } from "@/repositories";
import { getSharedSupabaseBrowserClient } from "@/repositories/supabase/client";
import { isSupabaseAuthConfigured } from "@/repositories/supabase/readEnv";
import {
  clearSession,
  ensureProfile,
  getSession,
  getSupabaseSession,
  loginOrCreateUser,
  setSession,
  signInWithGoogle as authSignInWithGoogle,
  signOutSupabase,
  subscribeAuthState,
} from "@/services/authService";

export interface AuthContextValue {
  /** Domain profile from `UserRepository` after session is established. */
  currentUser: User | null;
  /** Alias for `currentUser` (task naming). */
  user: User | null;
  /** Supabase Auth session when using Supabase; always `null` on demo / IndexedDB-only path. */
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when Supabase OAuth / magic link is available (real project URL, not Jest placeholder). */
  supabaseAuthAvailable: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDemoProfile: (profile: { email: string; name: string; picture: string }) => Promise<void>;
  logout: () => Promise<void>;
  /** Alias for `logout` (task naming). */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function createSupabaseClientOrNull(): ReturnType<typeof getSharedSupabaseBrowserClient> | null {
  if (!isSupabaseAuthConfigured()) {
    return null;
  }
  try {
    return getSharedSupabaseBrowserClient();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(createSupabaseClientOrNull);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseAuthAvailable = supabase !== null;

  const loadUserFromId = useCallback(async (userId: string) => {
    const user = await repositories.users.findById(userId);
    setCurrentUser(user ?? null);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthSession(null);
      const sessionId = getSession();
      if (!sessionId) {
        setIsLoading(false);
        return;
      }
      void loadUserFromId(sessionId)
        .catch(() => setCurrentUser(null))
        .finally(() => setIsLoading(false));
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      try {
        const session = await getSupabaseSession(supabase);
        if (cancelled) {
          return;
        }
        if (session?.user) {
          setAuthSession(session);
          await ensureProfile(supabase, session.user);
          setSession(session.user.id);
          await loadUserFromId(session.user.id);
        } else {
          setAuthSession(null);
          clearSession();
          setCurrentUser(null);
        }
      } catch {
        if (!cancelled) {
          setAuthSession(null);
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void hydrate();

    const { unsubscribe } = subscribeAuthState(supabase, (_event, session) => {
      void (async () => {
        if (session?.user) {
          setAuthSession(session);
          try {
            await ensureProfile(supabase, session.user);
            setSession(session.user.id);
            await loadUserFromId(session.user.id);
          } catch {
            setCurrentUser(null);
          }
        } else {
          setAuthSession(null);
          clearSession();
          setCurrentUser(null);
        }
      })();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [supabase, loadUserFromId]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      throw new Error("Supabase Auth is not configured");
    }
    await authSignInWithGoogle(supabase);
  }, [supabase]);

  const signInWithDemoProfile = useCallback(
    async (profile: { email: string; name: string; picture: string }) => {
      const user = await loginOrCreateUser(repositories.users, profile);
      setSession(user.id);
      setCurrentUser(user);
    },
    [],
  );

  const logout = useCallback(async () => {
    if (supabase) {
      try {
        await signOutSupabase(supabase);
      } catch {
        /* still clear local state */
      }
    }
    clearSession();
    setAuthSession(null);
    setCurrentUser(null);
  }, [supabase]);

  const value: AuthContextValue = {
    currentUser,
    user: currentUser,
    session: authSession,
    isAuthenticated: currentUser !== null,
    isLoading,
    supabaseAuthAvailable,
    signInWithGoogle,
    signInWithDemoProfile,
    logout,
    signOut: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
