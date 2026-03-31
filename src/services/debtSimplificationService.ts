// Implements: TASK-018 (REQ-014)

const TOLERANCE_CENTS = 1;

export interface SimplifiedSettlement {
  from: string;
  to: string;
  amount: number;
}

/**
 * Simplifies debts using a greedy net-balance algorithm.
 * Given per-user net balances (positive = owed money, negative = owes money),
 * returns the minimal set of settlements to clear all debts.
 * All amounts are in integer cents.
 */
export function simplifyDebts(
  netBalances: Map<string, number>,
): Array<{ from: string; to: string; amount: number }> {
  const result: SimplifiedSettlement[] = [];

  const creditors: { userId: string; balance: number }[] = [];
  const debtors: { userId: string; balance: number }[] = [];

  for (const [userId, balance] of netBalances) {
    if (balance > 0) {
      creditors.push({ userId, balance });
    } else if (balance < 0) {
      debtors.push({ userId, balance });
    }
  }

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);

  while (creditors.length > 0 && debtors.length > 0) {
    const C = creditors[0];
    const D = debtors[0];

    const transferAmount = Math.min(C.balance, Math.abs(D.balance));
    if (transferAmount <= 0) break;

    result.push({ from: D.userId, to: C.userId, amount: transferAmount });

    C.balance -= transferAmount;
    D.balance += transferAmount;

    if (Math.abs(C.balance) <= TOLERANCE_CENTS) {
      creditors.shift();
    }
    if (Math.abs(D.balance) <= TOLERANCE_CENTS) {
      debtors.shift();
    }
  }

  return result;
}
