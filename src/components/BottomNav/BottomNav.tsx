"use client";
// Implements: TASK-029

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./constants";
import { ROUTES } from "@/constants/routes";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex w-full items-end justify-center gap-0 bg-primary-dark pb-[env(safe-area-inset-bottom)] pt-2"
      data-testid="bottom-nav"
    >
      <div className="flex w-full max-w-lg items-end justify-around">
        {NAV_ITEMS.map((item, index) => {
          const isAddExpense = item.href === ROUTES.ADD_EXPENSE;
          const isActive = pathname === item.href;

          if (isAddExpense) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="-mt-6 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent shadow-lg transition-colors hover:bg-accent/90"
                aria-label={item.label}
              >
                <span className="text-white">{item.icon}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 ${
                isActive ? "text-white" : "text-white/60"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex h-6 w-6 items-center justify-center [&>svg]:h-6 [&>svg]:w-6">
                {item.icon}
              </span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
