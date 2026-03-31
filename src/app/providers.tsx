"use client";
// Implements: TASK-052 (REQ-001, REQ-024, REQ-025), TASK-059 (REQ-032)

import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { ToastProvider } from "@/components/Toast/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <CurrencyProvider>
          <ToastProvider>{children}</ToastProvider>
        </CurrencyProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
}
