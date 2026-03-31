// Implements: TASK-014 (REQ-024)

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseRepositories } from "./factory";
import { SupabaseActivityRepository } from "./ActivityRepository";
import { SupabaseExpenseRepository } from "./ExpenseRepository";
import { SupabaseGroupRepository } from "./GroupRepository";
import { SupabaseSettlementRepository } from "./SettlementRepository";
import { SupabaseUserRepository } from "./UserRepository";

describe("createSupabaseRepositories", () => {
  it("returns all five repositories sharing the client", () => {
    const client = { from: jest.fn() } as unknown as SupabaseClient;
    const repos = createSupabaseRepositories(client);

    expect(repos.users).toBeInstanceOf(SupabaseUserRepository);
    expect(repos.groups).toBeInstanceOf(SupabaseGroupRepository);
    expect(repos.expenses).toBeInstanceOf(SupabaseExpenseRepository);
    expect(repos.settlements).toBeInstanceOf(SupabaseSettlementRepository);
    expect(repos.activity).toBeInstanceOf(SupabaseActivityRepository);

    expect(typeof repos.users.findById).toBe("function");
    expect(typeof repos.groups.findById).toBe("function");
    expect(typeof repos.expenses.findById).toBe("function");
    expect(typeof repos.settlements.findById).toBe("function");
    expect(typeof repos.activity.log).toBe("function");
  });
});
