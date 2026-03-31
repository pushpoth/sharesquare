"use client";
// Implements: TASK-051

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { MemberAvatar } from "@/components/MemberAvatar/MemberAvatar";
import { ROUTES } from "@/constants/routes";
import { db } from "@/repositories/indexeddb/database";
import { buildExportPayload, downloadJson, generateExportFilename } from "@/services/exportService";
import { validateImportJson, importData } from "@/services/importService";
import { useToast } from "@/components/Toast/Toast";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const [users, groups, groupMembers, expenses, expensePayers, expenseSplits, settlements] =
        await Promise.all([
          db.users.toArray(),
          db.groups.toArray(),
          db.groupMembers.toArray(),
          db.expenses.toArray(),
          db.expensePayers.toArray(),
          db.expenseSplits.toArray(),
          db.settlements.toArray(),
        ]);
      const payload = buildExportPayload({
        users,
        groups,
        groupMembers,
        expenses,
        expensePayers,
        expenseSplits,
        settlements,
      });
      const jsonString = JSON.stringify(payload);
      const filename = generateExportFilename();
      downloadJson(jsonString, filename);
      showToast("Data exported successfully");
    } catch {
      showToast("Export failed", "error");
    }
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const result = validateImportJson(text);
      if (!result.valid) {
        showToast(result.errors.join(". "), "error");
        return;
      }
      const { imported, skipped } = await importData(db, result.data, "overwrite");
      showToast(`Imported ${imported} records, skipped ${skipped} existing`);
      window.location.reload();
    } catch {
      showToast("Import failed", "error");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.LANDING, { replace: true });
  };

  return (
    <AppLayout>
      <div className="space-y-8 px-4 py-6" data-testid="settings-page">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Profile</h2>
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white p-6">
            <MemberAvatar
              name={currentUser?.name ?? ""}
              avatarUrl={currentUser?.avatarUrl}
              size="lg"
            />
            <div className="text-center">
              <p className="font-medium text-text-primary">{currentUser?.name ?? "Unknown"}</p>
              <p className="text-sm text-text-secondary">{currentUser?.email ?? ""}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Data</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleExport}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted"
            >
              Export Data
            </button>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-muted disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import Data"}
              </button>
            </div>
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-lg bg-owing-badge px-4 py-2 font-medium text-white hover:bg-owing-badge/90"
          >
            Sign Out
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
