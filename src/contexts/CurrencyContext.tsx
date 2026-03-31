"use client";
// Implements: TASK-059 (REQ-032)

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY_CODE,
  type SupportedCurrencyCode,
  isSupportedCurrencyCode,
} from "@/constants/currency";

const CURRENCY_EVENT = "sharesquare:currency-changed";

export interface CurrencyContextValue {
  currencyCode: SupportedCurrencyCode;
  setCurrencyCode: (code: SupportedCurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): SupportedCurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY_CODE;
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (raw && isSupportedCurrencyCode(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_CURRENCY_CODE;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyState] = useState<SupportedCurrencyCode>(() =>
    readStoredCurrency(),
  );

  useEffect(() => {
    setCurrencyState(readStoredCurrency());
  }, []);

  const setCurrencyCode = useCallback((code: SupportedCurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent<SupportedCurrencyCode>(CURRENCY_EVENT, { detail: code }));
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CURRENCY_STORAGE_KEY && e.newValue && isSupportedCurrencyCode(e.newValue)) {
        setCurrencyState(e.newValue);
      }
    };
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<SupportedCurrencyCode>;
      if (ce.detail && isSupportedCurrencyCode(ce.detail)) {
        setCurrencyState(ce.detail);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(CURRENCY_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CURRENCY_EVENT, onCustom);
    };
  }, []);

  const value = useMemo(
    () => ({ currencyCode, setCurrencyCode }),
    [currencyCode, setCurrencyCode],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currencyCode: DEFAULT_CURRENCY_CODE,
      setCurrencyCode: () => {},
    };
  }
  return ctx;
}
