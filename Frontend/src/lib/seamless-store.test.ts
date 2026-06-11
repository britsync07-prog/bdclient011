import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserBalance,
  applyTransaction,
  isDuplicateTransaction,
  markTransaction,
  resetStore
} from './seamless-store';

describe('seamless-store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Duplicate Transaction Detection', () => {
    it('should return false for a new transaction code', () => {
      expect(isDuplicateTransaction('tx123')).toBe(false);
    });

    it('should return true after a transaction has been marked', () => {
      const txCode = 'tx456';
      markTransaction(txCode);
      expect(isDuplicateTransaction(txCode)).toBe(true);
    });

    it('should correctly handle multiple distinct transactions', () => {
      markTransaction('tx1');
      markTransaction('tx2');

      expect(isDuplicateTransaction('tx1')).toBe(true);
      expect(isDuplicateTransaction('tx2')).toBe(true);
      expect(isDuplicateTransaction('tx3')).toBe(false);
    });
  });

  describe('User Balance Management', () => {
    it('should return the initial balance for the default test user', () => {
      expect(getUserBalance('testuser1')).toBe(10000);
    });

    it('should return 0 for a non-existent user', () => {
      expect(getUserBalance('unknown')).toBe(0);
    });

    it('should correctly apply a positive transaction (deposit)', () => {
      const newBalance = applyTransaction('testuser1', 500);
      expect(newBalance).toBe(10500);
      expect(getUserBalance('testuser1')).toBe(10500);
    });

    it('should correctly apply a negative transaction (withdrawal)', () => {
      const newBalance = applyTransaction('testuser1', -200);
      expect(newBalance).toBe(9800);
      expect(getUserBalance('testuser1')).toBe(9800);
    });

    it('should create a new user entry if applying a transaction to a non-existent user', () => {
      const newBalance = applyTransaction('newuser', 100);
      expect(newBalance).toBe(100);
      expect(getUserBalance('newuser')).toBe(100);
    });
  });
});
