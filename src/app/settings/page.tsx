"use client";
// Implements: TASK-051 (REQ-002, REQ-021, REQ-022), TASK-059 (REQ-032)

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSupportedCurrencyCode, SUPPORTED_CURRENCIES } from "@/constants/currency";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/layouts/AppLayout/AppLayout";
import { MemberAvatar } from "@/components/MemberAvatar/MemberAvatar";
import { ROUTES } from "@/constants/routes";
import { db } from "@/repositories/indexeddb/database";
import { repositories } from "@/repositories";
import { exportAllData, downloadJson, generateExportFilename } from "@/services/exportService";
import { validateImportJson, importData, createDexieImportWriter } from "@/services/importService";
import { useToast } from "@/components/Toast/Toast";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const { currencyCode, setCurrencyCode } = useCurrency();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    if (!currentUser?.id) {
      showToast("Sign in to export your data", "error");
      return;
    }
    try {
      const payload = await exportAllData(repositories, currentUser.id);
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
      const { imported, skipped } = await importData(
        createDexieImportWriter(db),
        result.data,
        "overwrite",
      );
      showToast(`Imported ${imported} records, skipped ${skipped} existing`);
      window.location.reload();
    } catch {
      showToast("Import failed", "error");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleSignOut = async () => {
    await logout();
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
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Preferences</h2>
          <p className="mb-2 text-sm text-text-secondary">
            Display currency (no exchange conversion — amounts keep the same numeric values).
          </p>
          <label htmlFor="settings-currency" className="sr-only">
            Display currency
          </label>
          <select
            id="settings-currency"
            data-testid="settings-currency-select"
            value={currencyCode}
            onChange={(e) => {
              const v = e.target.value;
              if (isSupportedCurrencyCode(v)) setCurrencyCode(v);
            }}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-text-primary"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Data</h2>
          <div className="space-y-3">
            <button
              type="button"
              data-testid="settings-export"
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
                data-testid="settings-import-trigger"
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
            data-testid="settings-sign-out"
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
