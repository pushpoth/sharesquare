// Implements: TASK-001 (REQ-026, REQ-027)
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "@/app/page";
import HomePage from "@/app/home/page";
import ActivityPage from "@/app/activity/page";
import SettingsPage from "@/app/settings/page";
import GroupsPage from "@/app/groups/page";
import GroupDetailPage from "@/app/groups/[id]/page";
import AddExpensePage from "@/app/expenses/new/page";
import EditExpensePage from "@/app/expenses/[id]/edit/page";

function PageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-accent"
        aria-label="Loading"
      />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/expenses/new" element={<AddExpensePage />} />
        <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
      </Routes>
    </Suspense>
  );
}
