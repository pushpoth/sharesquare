"use client";

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
