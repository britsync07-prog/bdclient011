import { test, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  getUserBalance,
  applyTransaction,
  isDuplicateTransaction,
  markTransaction,
  resetStore
} from './seamless-store';

beforeEach(() => {
  resetStore();
});

test('markTransaction and isDuplicateTransaction', () => {
  const txCode = 'tx123';

  assert.strictEqual(isDuplicateTransaction(txCode), false, 'Transaction should not be duplicate initially');

  markTransaction(txCode);

  assert.strictEqual(isDuplicateTransaction(txCode), true, 'Transaction should be marked as duplicate');
});

test('getUserBalance returns correct initial balance', () => {
  assert.strictEqual(getUserBalance('testuser1'), 10000, 'Initial balance for testuser1 should be 10000');
  assert.strictEqual(getUserBalance('nonexistent'), 0, 'Balance for nonexistent user should be 0');
});

test('applyTransaction updates user balance', () => {
  const user = 'testuser1';
  const initialBalance = getUserBalance(user);
  const amount = 500;

  const newBalance = applyTransaction(user, amount);

  assert.strictEqual(newBalance, initialBalance + amount, 'applyTransaction should return the updated balance');
  assert.strictEqual(getUserBalance(user), initialBalance + amount, 'getUserBalance should return the updated balance');
});

test('applyTransaction handles negative amounts', () => {
  const user = 'testuser1';
  const initialBalance = getUserBalance(user);
  const amount = -500;

  const newBalance = applyTransaction(user, amount);

  assert.strictEqual(newBalance, initialBalance + amount, 'applyTransaction should handle deductions correctly');
  assert.strictEqual(getUserBalance(user), initialBalance + amount, 'Balance should be decreased');
});

test('resetStore clears transactions and resets balances', () => {
  markTransaction('tx1');
  applyTransaction('testuser1', 500);

  resetStore();

  assert.strictEqual(isDuplicateTransaction('tx1'), false, 'Transactions should be cleared');
  assert.strictEqual(getUserBalance('testuser1'), 10000, 'Balances should be reset');
});
