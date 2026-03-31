// Implements: TASK-014 (REQ-024)

import { db } from "./indexeddb/database";
import { DexieActivityRepository } from "./indexeddb/ActivityRepository";
import { DexieExpenseRepository } from "./indexeddb/ExpenseRepository";
import { DexieGroupRepository } from "./indexeddb/GroupRepository";
import { DexieSettlementRepository } from "./indexeddb/SettlementRepository";
import { DexieUserRepository } from "./indexeddb/UserRepository";
import { getSharedSupabaseBrowserClient } from "./supabase/client";
import { createSupabaseRepositories, type RepositoryBundle } from "./supabase/factory";
import { isSupabaseRepositoriesEnabled } from "./supabase/readEnv";

function createDexieRepositories(): RepositoryBundle {
  return {
    users: new DexieUserRepository(db),
    groups: new DexieGroupRepository(db),
    expenses: new DexieExpenseRepository(db),
    settlements: new DexieSettlementRepository(db),
    activity: new DexieActivityRepository(db),
  };
}

function resolveRepositories(): RepositoryBundle {
  if (!isSupabaseRepositoriesEnabled()) {
    return createDexieRepositories();
  }
  try {
    return createSupabaseRepositories(getSharedSupabaseBrowserClient());
  } catch (err) {
    console.warn(
      "[repositories] VITE_USE_SUPABASE_REPOS=true but client could not be created; using IndexedDB",
      err,
    );
    return createDexieRepositories();
  }
}

export const repositories = resolveRepositories();
