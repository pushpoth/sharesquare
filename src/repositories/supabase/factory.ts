// Implements: TASK-014 (REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IActivityRepository } from "../interfaces/IActivityRepository";
import type { IExpenseRepository } from "../interfaces/IExpenseRepository";
import type { IGroupRepository } from "../interfaces/IGroupRepository";
import type { ISettlementRepository } from "../interfaces/ISettlementRepository";
import type { IUserRepository } from "../interfaces/IUserRepository";
import { SupabaseActivityRepository } from "./ActivityRepository";
import { SupabaseExpenseRepository } from "./ExpenseRepository";
import { SupabaseGroupRepository } from "./GroupRepository";
import { SupabaseSettlementRepository } from "./SettlementRepository";
import { SupabaseUserRepository } from "./UserRepository";

export type RepositoryBundle = {
  users: IUserRepository;
  groups: IGroupRepository;
  expenses: IExpenseRepository;
  settlements: ISettlementRepository;
  activity: IActivityRepository;
};

export function createSupabaseRepositories(client: SupabaseClient): RepositoryBundle {
  return {
    users: new SupabaseUserRepository(client),
    groups: new SupabaseGroupRepository(client),
    expenses: new SupabaseExpenseRepository(client),
    settlements: new SupabaseSettlementRepository(client),
    activity: new SupabaseActivityRepository(client),
  };
}
