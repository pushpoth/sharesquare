"use client";
// Implements: TASK-023 (REQ-024)

import React, { createContext, useContext } from "react";
import type { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import type { IGroupRepository } from "@/repositories/interfaces/IGroupRepository";
import type { IExpenseRepository } from "@/repositories/interfaces/IExpenseRepository";
import type { ISettlementRepository } from "@/repositories/interfaces/ISettlementRepository";
import type { IActivityRepository } from "@/repositories/interfaces/IActivityRepository";
import { repositories } from "@/repositories";

export interface RepositoryContextValue {
  users: IUserRepository;
  groups: IGroupRepository;
  expenses: IExpenseRepository;
  settlements: ISettlementRepository;
  activity: IActivityRepository;
}

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export function RepositoryProvider({
  children,
  /** Optional bundle for tests; production uses the app singleton from `@/repositories`. */
  value,
}: {
  children: React.ReactNode;
  value?: RepositoryContextValue;
}) {
  return (
    <RepositoryContext.Provider value={value ?? repositories}>{children}</RepositoryContext.Provider>
  );
}

export function useRepositories() {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error("useRepositories must be used within RepositoryProvider");
  }
  return ctx;
}
