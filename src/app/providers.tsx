"use client";
// Implements: TASK-052 (REQ-001, REQ-024, REQ-025) — provider nesting with Repository + Auth + Toast

import { AuthProvider } from "@/contexts/AuthContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { ToastProvider } from "@/components/Toast/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
}
