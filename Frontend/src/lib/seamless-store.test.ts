import { describe, it, expect, beforeEach } from 'vitest';
import { getUserBalance, applyTransaction, isDuplicateTransaction, markTransaction, resetStore } from './seamless-store';

describe('seamless-store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('getUserBalance', () => {
    it('should return the initial balance for testuser1', () => {
      expect(getUserBalance('testuser1')).toBe(10000);
    });

    it('should return 0 for a non-existent user', () => {
      expect(getUserBalance('unknown')).toBe(0);
    });
  });

  describe('applyTransaction', () => {
    it('should increase the balance when amount is positive', () => {
      const result = applyTransaction('testuser1', 500);
      expect(result).toBe(10500);
      expect(getUserBalance('testuser1')).toBe(10500);
    });

    it('should decrease the balance when amount is negative', () => {
      const result = applyTransaction('testuser1', -500);
      expect(result).toBe(9500);
      expect(getUserBalance('testuser1')).toBe(9500);
    });

    it('should create a new user entry if user does not exist', () => {
      const result = applyTransaction('newuser', 100);
      expect(result).toBe(100);
      expect(getUserBalance('newuser')).toBe(100);
    });

    it('should handle multiple transactions correctly', () => {
      applyTransaction('testuser1', 100);
      applyTransaction('testuser1', 200);
      const result = applyTransaction('testuser1', -50);
      expect(result).toBe(10250);
      expect(getUserBalance('testuser1')).toBe(10250);
    });
  });

  describe('transaction marking', () => {
    it('should correctly mark and check for duplicate transactions', () => {
      const txId = 'tx-123';
      expect(isDuplicateTransaction(txId)).toBe(false);
      markTransaction(txId);
      expect(isDuplicateTransaction(txId)).toBe(true);
    });

    it('should handle multiple transaction IDs', () => {
      markTransaction('tx-1');
      markTransaction('tx-2');
      expect(isDuplicateTransaction('tx-1')).toBe(true);
      expect(isDuplicateTransaction('tx-2')).toBe(true);
      expect(isDuplicateTransaction('tx-3')).toBe(false);
    });
  });

  describe('resetStore', () => {
    it('should reset the store to initial state', () => {
      applyTransaction('testuser1', 1000);
      applyTransaction('newuser', 500);
      markTransaction('tx-1');

      resetStore();

      expect(getUserBalance('testuser1')).toBe(10000);
      expect(getUserBalance('newuser')).toBe(0);
      expect(isDuplicateTransaction('tx-1')).toBe(false);
    });
  });
});
