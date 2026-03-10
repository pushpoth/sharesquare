"use client";
// Implements: TASK-022 (REQ-001, REQ-002)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@/types";
import { repositories } from "@/repositories";
import {
  decodeGoogleCredential,
  getSession,
  loginOrCreateUser,
  setSession,
  clearSession,
} from "@/services/authService";

export interface AuthContextValue {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionId = getSession();
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    repositories.users
      .findById(sessionId)
      .then((user) => {
        setCurrentUser(user ?? null);
      })
      .catch(() => {
        setCurrentUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (credential: string) => {
    const profile = decodeGoogleCredential(credential);
    const user = await loginOrCreateUser(repositories.users, profile);
    setSession(user.id);
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const value: AuthContextValue = {
    currentUser,
    isAuthenticated: currentUser !== null,
    isLoading,
    login,
    logout,
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
