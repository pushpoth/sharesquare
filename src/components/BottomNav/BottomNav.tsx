"use client";
// Implements: TASK-029 (REQ-019, REQ-027)

import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./constants";
import { ROUTES } from "@/constants/routes";

function navLinkEnd(href: string): boolean {
  if (href === ROUTES.GROUPS) {
    return false;
  }
  return true;
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex w-full items-end justify-center gap-0 bg-primary-dark pb-[env(safe-area-inset-bottom)] pt-2"
      data-testid="bottom-nav"
    >
      <div className="flex w-full max-w-lg items-end justify-around">
        {NAV_ITEMS.map((item) => {
          const isAddExpense = item.href === ROUTES.ADD_EXPENSE;

          if (isAddExpense) {
            return (
              <NavLink
                key={item.href}
                to={item.href}
                end
                data-testid="bottom-nav-add-expense"
                className={({ isActive }) =>
                  `-mt-6 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent shadow-lg transition-colors hover:bg-accent/90 ${
                    isActive ? "ring-2 ring-white ring-offset-2 ring-offset-primary-dark" : ""
                  }`
                }
                aria-label={item.label}
              >
                <span className="text-white">{item.icon}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={navLinkEnd(item.href)}
              data-testid={`bottom-nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-1 ${isActive ? "text-white" : "text-white/60"}`
              }
              aria-label={item.label}
            >
              <span
                className="flex h-6 w-6 items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="text-xs">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
