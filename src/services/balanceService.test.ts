// Implements: TASK-017 (REQ-013)

import {
  calculateGroupBalances,
  calculateOverallBalances,
  calculatePairwiseBalances,
} from "./balanceService";
import type { Expense, ExpensePayer, ExpenseSplit } from "@/types/expense";
import type { Settlement } from "@/types/settlement";

const now = "2025-01-01T00:00:00Z";

function expense(
  id: string,
  groupId: string,
  amount: number,
  overrides?: Partial<Expense>
): Expense {
  return {
    id,
    groupId,
    title: "Test",
    amount,
    date: "2025-01-01",
    category: "food",
    createdBy: "u1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function payer(id: string, expenseId: string, userId: string, amount: number): ExpensePayer {
  return { id, expenseId, userId, amount };
}

function split(id: string, expenseId: string, userId: string, amountOwed: number): ExpenseSplit {
  return { id, expenseId, userId, amountOwed };
}

function settlement(
  id: string,
  groupId: string,
  fromUserId: string,
  toUserId: string,
  amount: number
): Settlement {
  return {
    id,
    groupId,
    fromUserId,
    toUserId,
    amount,
    date: "2025-01-01",
    createdAt: now,
  };
}

describe("balanceService", () => {
  describe("calculateGroupBalances", () => {
    it("single expense, single payer, equal split among 2 (payer should have positive balance)", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [payer("p1", "e1", "alice", 1000)];
      const splits = [
        split("s1", "e1", "alice", 500),
        split("s2", "e1", "bob", 500),
      ];
      const settlements: Settlement[] = [];

      const balances = calculateGroupBalances(expenses, payers, splits, settlements);

      expect(balances.get("alice")).toBe(500); // paid 1000, owed 500
      expect(balances.get("bob")).toBe(-500); // paid 0, owed 500
    });

    it("multiple expenses", () => {
      const expenses = [
        expense("e1", "g1", 1000),
        expense("e2", "g1", 600),
      ];
      const payers = [
        payer("p1", "e1", "alice", 1000),
        payer("p2", "e2", "bob", 600),
      ];
      const splits = [
        split("s1", "e1", "alice", 500),
        split("s2", "e1", "bob", 500),
        split("s3", "e2", "alice", 300),
        split("s4", "e2", "bob", 300),
      ];
      const settlements: Settlement[] = [];

      const balances = calculateGroupBalances(expenses, payers, splits, settlements);

      expect(balances.get("alice")).toBe(200); // paid 1000, owed 500+300=800
      expect(balances.get("bob")).toBe(-200); // paid 600, owed 500+300=800
    });

    it("expenses with settlements reducing balances", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [payer("p1", "e1", "alice", 1000)];
      const splits = [
        split("s1", "e1", "alice", 500),
        split("s2", "e1", "bob", 500),
      ];
      const settlements = [settlement("st1", "g1", "bob", "alice", 500)];

      const balances = calculateGroupBalances(expenses, payers, splits, settlements);

      expect(balances.get("alice")).toBe(0); // paid 1000, owed 500, received 500
      expect(balances.get("bob")).toBe(0); // paid 0, owed 500, sent 500
    });

    it("edge: zero expenses → empty/zero balances", () => {
      const balances = calculateGroupBalances([], [], [], []);
      expect(balances.size).toBe(0);
    });

    it("edge: single member group → zero balance", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [payer("p1", "e1", "alice", 1000)];
      const splits = [split("s1", "e1", "alice", 1000)];
      const settlements: Settlement[] = [];

      const balances = calculateGroupBalances(expenses, payers, splits, settlements);

      expect(balances.get("alice")).toBe(0);
    });
  });

  describe("calculateOverallBalances", () => {
    it("cross-group aggregation", () => {
      const group1 = new Map<string, number>([
        ["alice", 300],
        ["bob", -300],
      ]);
      const group2 = new Map<string, number>([
        ["alice", -200],
        ["charlie", 200],
      ]);

      const alice = calculateOverallBalances("alice", [group1, group2]);
      expect(alice.owedToYou).toBe(300); // sum of positive
      expect(alice.youOwe).toBe(200); // sum of negative (as positive)

      const bob = calculateOverallBalances("bob", [group1, group2]);
      expect(bob.owedToYou).toBe(0);
      expect(bob.youOwe).toBe(300);

      const charlie = calculateOverallBalances("charlie", [group1, group2]);
      expect(charlie.owedToYou).toBe(200);
      expect(charlie.youOwe).toBe(0);
    });

    it("user not in any map returns zeros", () => {
      const group1 = new Map<string, number>([["alice", 100]]);
      const result = calculateOverallBalances("unknown", [group1]);
      expect(result.youOwe).toBe(0);
      expect(result.owedToYou).toBe(0);
    });
  });

  describe("calculatePairwiseBalances", () => {
    it("single expense, single payer, equal split", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [payer("p1", "e1", "alice", 1000)];
      const splits = [
        split("s1", "e1", "alice", 500),
        split("s2", "e1", "bob", 500),
      ];
      const settlements: Settlement[] = [];

      const pairwise = calculatePairwiseBalances(expenses, payers, splits, settlements);

      expect(pairwise).toHaveLength(1);
      expect(pairwise[0]).toEqual({ fromUserId: "bob", toUserId: "alice", amount: 500 });
    });

    it("multiple payers, proportional split", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [
        payer("p1", "e1", "alice", 600),
        payer("p2", "e1", "bob", 400),
      ];
      const splits = [split("s1", "e1", "charlie", 1000)];
      const settlements: Settlement[] = [];

      const pairwise = calculatePairwiseBalances(expenses, payers, splits, settlements);

      expect(pairwise).toHaveLength(2);
      const aliceDebt = pairwise.find((p) => p.toUserId === "alice");
      const bobDebt = pairwise.find((p) => p.toUserId === "bob");
      expect(aliceDebt?.amount).toBe(600);
      expect(bobDebt?.amount).toBe(400);
      expect(aliceDebt?.fromUserId).toBe("charlie");
      expect(bobDebt?.fromUserId).toBe("charlie");
    });

    it("pairwise with settlement reduces debt", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [payer("p1", "e1", "alice", 1000)];
      const splits = [split("s1", "e1", "bob", 500)];
      const settlements = [settlement("st1", "g1", "bob", "alice", 500)];

      const pairwise = calculatePairwiseBalances(expenses, payers, splits, settlements);

      expect(pairwise).toHaveLength(0);
    });

    it("pairwise with partial settlement", () => {
      const expenses = [expense("e1", "g1", 1000)];
      const payers = [payer("p1", "e1", "alice", 1000)];
      const splits = [split("s1", "e1", "bob", 500)];
      const settlements = [settlement("st1", "g1", "bob", "alice", 200)];

      const pairwise = calculatePairwiseBalances(expenses, payers, splits, settlements);

      expect(pairwise).toHaveLength(1);
      expect(pairwise[0]).toEqual({ fromUserId: "bob", toUserId: "alice", amount: 300 });
    });

    it("edge: zero expenses → empty pairwise", () => {
      const pairwise = calculatePairwiseBalances([], [], [], []);
      expect(pairwise).toHaveLength(0);
    });
  });

  describe("integer arithmetic", () => {
    it("uses integer cents throughout", () => {
      const expenses = [expense("e1", "g1", 333)];
      const payers = [payer("p1", "e1", "alice", 333)];
      const splits = [
        split("s1", "e1", "alice", 111),
        split("s2", "e1", "bob", 111),
        split("s3", "e1", "charlie", 111),
      ];
      const settlements: Settlement[] = [];

      const balances = calculateGroupBalances(expenses, payers, splits, settlements);

      expect(Number.isInteger(balances.get("alice"))).toBe(true);
      expect(Number.isInteger(balances.get("bob"))).toBe(true);
      expect(Number.isInteger(balances.get("charlie"))).toBe(true);
    });
  });
});
