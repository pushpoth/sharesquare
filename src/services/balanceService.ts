// Implements: TASK-017 (REQ-013)

import type { Expense, ExpensePayer, ExpenseSplit } from "@/types/expense";
import type { Settlement } from "@/types/settlement";

/**
 * Calculates per-user net balance for a group.
 * balance = total_paid - total_owed + settlements_sent - settlements_received
 * Positive = others owe you. Negative = you owe others.
 */
export function calculateGroupBalances(
  expenses: Expense[],
  payers: ExpensePayer[],
  splits: ExpenseSplit[],
  settlements: Settlement[],
): Map<string, number> {
  const balanceByUser = new Map<string, number>();

  const expenseIds = new Set(expenses.map((e) => e.id));

  for (const p of payers) {
    if (!expenseIds.has(p.expenseId)) continue;
    const current = balanceByUser.get(p.userId) ?? 0;
    balanceByUser.set(p.userId, current + p.amount);
  }

  for (const s of splits) {
    if (!expenseIds.has(s.expenseId)) continue;
    const current = balanceByUser.get(s.userId) ?? 0;
    balanceByUser.set(s.userId, current - s.amountOwed);
  }

  for (const st of settlements) {
    const fromCurrent = balanceByUser.get(st.fromUserId) ?? 0;
    balanceByUser.set(st.fromUserId, fromCurrent + st.amount);

    const toCurrent = balanceByUser.get(st.toUserId) ?? 0;
    balanceByUser.set(st.toUserId, toCurrent - st.amount);
  }

  return balanceByUser;
}

/**
 * Aggregates a user's balance across multiple group balance maps.
 * youOwe = sum of negative balances (as positive number)
 * owedToYou = sum of positive balances
 */
export function calculateOverallBalances(
  userId: string,
  userBalanceMaps: Map<string, number>[],
): { youOwe: number; owedToYou: number } {
  let youOwe = 0;
  let owedToYou = 0;
  for (const m of userBalanceMaps) {
    const bal = m.get(userId) ?? 0;
    if (bal < 0) youOwe += Math.abs(bal);
    else if (bal > 0) owedToYou += bal;
  }
  return { youOwe, owedToYou };
}

export interface PairwiseBalance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Computes who owes whom. For each expense, each split member owes each payer
 * proportionally. Settlements reduce the corresponding debt.
 */
export function calculatePairwiseBalances(
  expenses: Expense[],
  payers: ExpensePayer[],
  splits: ExpenseSplit[],
  settlements: Settlement[],
): PairwiseBalance[] {
  const debtMap = new Map<string, number>(); // key: "fromUserId|toUserId", value: cents

  const expenseIds = new Set(expenses.map((e) => e.id));

  const payersByExpense = new Map<string, ExpensePayer[]>();
  for (const p of payers) {
    if (!expenseIds.has(p.expenseId)) continue;
    const list = payersByExpense.get(p.expenseId) ?? [];
    list.push(p);
    payersByExpense.set(p.expenseId, list);
  }

  const splitsByExpense = new Map<string, ExpenseSplit[]>();
  for (const s of splits) {
    if (!expenseIds.has(s.expenseId)) continue;
    const list = splitsByExpense.get(s.expenseId) ?? [];
    list.push(s);
    splitsByExpense.set(s.expenseId, list);
  }

  for (const expenseId of expenseIds) {
    const expensePayers = payersByExpense.get(expenseId) ?? [];
    const expenseSplits = splitsByExpense.get(expenseId) ?? [];
    const totalPaid = expensePayers.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid === 0) continue;

    for (const split of expenseSplits) {
      for (const payer of expensePayers) {
        if (split.userId === payer.userId) continue;
        const amount = Math.round((payer.amount / totalPaid) * split.amountOwed);
        if (amount <= 0) continue;
        const key = `${split.userId}|${payer.userId}`;
        const current = debtMap.get(key) ?? 0;
        debtMap.set(key, current + amount);
      }
    }
  }

  for (const st of settlements) {
    const key = `${st.fromUserId}|${st.toUserId}`;
    const current = debtMap.get(key) ?? 0;
    const newDebt = current - st.amount;
    if (newDebt <= 0) {
      debtMap.delete(key);
      if (newDebt < 0) {
        const reverseKey = `${st.toUserId}|${st.fromUserId}`;
        const reverseCurrent = debtMap.get(reverseKey) ?? 0;
        debtMap.set(reverseKey, reverseCurrent + Math.abs(newDebt));
      }
    } else {
      debtMap.set(key, newDebt);
    }
  }

  const result: PairwiseBalance[] = [];
  for (const [key, amount] of debtMap) {
    if (amount <= 0) continue;
    const [fromUserId, toUserId] = key.split("|");
    result.push({ fromUserId, toUserId, amount });
  }
  return result;
}
