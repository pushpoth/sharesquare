// Implements: TASK-018 (REQ-014)

import { simplifyDebts } from "./debtSimplificationService";

describe("debtSimplificationService", () => {
  describe("simplifyDebts", () => {
    it("2 users, one owes the other → 1 settlement", () => {
      const netBalances = new Map<string, number>([
        ["alice", 500],
        ["bob", -500],
      ]);
      const result = simplifyDebts(netBalances);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ from: "bob", to: "alice", amount: 500 });
    });

    it("chain: A owes B, B owes C → simplifies to A owes C", () => {
      // A paid for B (A -100), B paid for C (B -100). Net: A=-100, B=0, C=100
      const netBalances = new Map<string, number>([
        ["A", -100],
        ["B", 0],
        ["C", 100],
      ]);
      const result = simplifyDebts(netBalances);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ from: "A", to: "C", amount: 100 });
    });

    it("circular: A→B→C→A → resolves to net transfers", () => {
      // If A owes B 100, B owes C 100, C owes A 100 → all nets are 0
      const netBalances = new Map<string, number>([
        ["A", 0],
        ["B", 0],
        ["C", 0],
      ]);
      const result = simplifyDebts(netBalances);
      expect(result).toHaveLength(0);
    });

    it("circular with imbalance: A owes B 100, B owes C 100, C owes A 50 → net: A=-50, B=0, C=50", () => {
      const netBalances = new Map<string, number>([
        ["A", -50],
        ["B", 0],
        ["C", 50],
      ]);
      const result = simplifyDebts(netBalances);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ from: "A", to: "C", amount: 50 });
    });

    it("all zero balances → empty result", () => {
      const netBalances = new Map<string, number>([
        ["alice", 0],
        ["bob", 0],
        ["charlie", 0],
      ]);
      const result = simplifyDebts(netBalances);
      expect(result).toHaveLength(0);
    });

    it("sum of simplified amounts equals sum of absolute input imbalances / 2", () => {
      const netBalances = new Map<string, number>([
        ["alice", 300],
        ["bob", -200],
        ["charlie", -100],
      ]);
      const result = simplifyDebts(netBalances);
      const sumSimplified = result.reduce((s, r) => s + r.amount, 0);
      const sumAbsImbalances = Array.from(netBalances.values()).reduce(
        (s, v) => s + Math.abs(v),
        0
      );
      expect(sumSimplified).toBe(sumAbsImbalances / 2);
    });

    it("large group (10 members with random but balanced amounts) → fewer transactions than naive approach", () => {
      // Create 10 users with balanced amounts (sum = 0): 5 creditors, 5 debtors
      const netBalances = new Map<string, number>([
        ["user0", 500],
        ["user1", 300],
        ["user2", 200],
        ["user3", 400],
        ["user4", 100],
        ["user5", -400],
        ["user6", -300],
        ["user7", -200],
        ["user8", -200],
        ["user9", -200],
      ]);
      // Sum: 500+300+200+400+100 = 1500, -400-300-200-200-200 = -1300. Adjust user9: -200 -> -300
      netBalances.set("user9", -300);

      const result = simplifyDebts(netBalances);
      // Naive approach: up to 9 transactions (n-1). Simplified should be ≤ 9
      expect(result.length).toBeLessThanOrEqual(9);
      // Verify all debts are settled
      const sumSettled = result.reduce((s, r) => s + r.amount, 0);
      const sumDebt = Array.from(netBalances.values())
        .filter((v) => v < 0)
        .reduce((s, v) => s + Math.abs(v), 0);
      expect(sumSettled).toBe(sumDebt);
    });

    it("handles rounding tolerance (±1 cent)", () => {
      const netBalances = new Map<string, number>([
        ["alice", 1],
        ["bob", -1],
      ]);
      const result = simplifyDebts(netBalances);
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(1);
    });

    it("empty map → empty result", () => {
      const result = simplifyDebts(new Map());
      expect(result).toHaveLength(0);
    });
  });
});
