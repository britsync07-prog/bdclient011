const balances = new Map<string, number>([["testuser1", 10000]]);
const processedTransactions = new Set<string>();

export function getUserBalance(userCode: string): number {
  return balances.get(userCode) ?? 0;
}

export function applyTransaction(userCode: string, amount: number): number {
  const current = getUserBalance(userCode);
  const next = current + amount;
  balances.set(userCode, next);
  return next;
}

export function isDuplicateTransaction(code: string): boolean {
  return processedTransactions.has(code);
}

export function markTransaction(code: string): void {
  processedTransactions.add(code);
}

export function resetStore(): void {
  balances.clear();
  balances.set("testuser1", 10000);
  processedTransactions.clear();
}
