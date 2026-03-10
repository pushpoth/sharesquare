// Implements: TASK-048
import { Suspense } from "react";
import AddExpenseClient from "./AddExpenseClient";

export default function AddExpensePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-accent" />
        </div>
      }
    >
      <AddExpenseClient />
    </Suspense>
  );
}
