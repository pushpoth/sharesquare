// Implements: TASK-059 (REQ-032)

import React from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { CURRENCY_STORAGE_KEY } from "@/constants/currency";
import { CurrencyProvider, useCurrency } from "./CurrencyContext";

describe("CurrencyProvider / useCurrency", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads initial value from localStorage", () => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, "EUR");
    const { result } = renderHook(() => useCurrency(), {
      wrapper: ({ children }) => <CurrencyProvider>{children}</CurrencyProvider>,
    });
    expect(result.current.currencyCode).toBe("EUR");
  });

  it("setCurrencyCode persists and updates state", () => {
    const { result } = renderHook(() => useCurrency(), {
      wrapper: ({ children }) => <CurrencyProvider>{children}</CurrencyProvider>,
    });

    act(() => {
      result.current.setCurrencyCode("JPY");
    });

    expect(result.current.currencyCode).toBe("JPY");
    expect(localStorage.getItem(CURRENCY_STORAGE_KEY)).toBe("JPY");
  });

  it("renders consumer with default USD when outside provider", () => {
    function Consumer() {
      const { currencyCode } = useCurrency();
      return <span data-testid="code">{currencyCode}</span>;
    }
    render(<Consumer />);
    expect(screen.getByTestId("code")).toHaveTextContent("USD");
  });
});
