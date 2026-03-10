"use client";
// Implements: TASK-030

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header/Header";
import { BottomNav } from "@/components/BottomNav/BottomNav";
import { ROUTES } from "@/constants/routes";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LANDING);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" data-testid="app-layout">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-accent"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface" data-testid="app-layout">
      <Header />
      <main className="mx-auto max-w-lg pt-14 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
