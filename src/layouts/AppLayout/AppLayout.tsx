"use client";
// Implements: TASK-030 (REQ-019, REQ-026)

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header/Header";
import { BottomNav } from "@/components/BottomNav/BottomNav";
import { ROUTES } from "@/constants/routes";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

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
    return <Navigate to={ROUTES.LANDING} replace />;
  }

  return (
    <div className="min-h-screen bg-surface" data-testid="app-layout">
      <Header />
      <main className="mx-auto max-w-lg pt-14 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
