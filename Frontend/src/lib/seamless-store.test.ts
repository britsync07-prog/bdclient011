import { describe, it, expect, beforeEach } from 'vitest';
import { getUserBalance, applyTransaction, isDuplicateTransaction, markTransaction, clearStore } from './seamless-store';

describe('seamless-store', () => {
  beforeEach(() => {
    clearStore();
  });

  describe('getUserBalance', () => {
    it('should return initial balance for testuser1', () => {
      expect(getUserBalance('testuser1')).toBe(10000);
    });

    it('should return 0 for non-existent users', () => {
      expect(getUserBalance('unknown')).toBe(0);
    });

    it('should return updated balance after transaction', () => {
      applyTransaction('testuser1', 500);
      expect(getUserBalance('testuser1')).toBe(10500);
    });
  });

  describe('applyTransaction', () => {
    it('should add amount to balance', () => {
      const newBalance = applyTransaction('testuser1', 2000);
      expect(newBalance).toBe(12000);
      expect(getUserBalance('testuser1')).toBe(12000);
    });

    it('should subtract amount (negative value) from balance', () => {
      const newBalance = applyTransaction('testuser1', -3000);
      expect(newBalance).toBe(7000);
      expect(getUserBalance('testuser1')).toBe(7000);
    });

    it('should initialize balance for new user and apply transaction', () => {
      const newBalance = applyTransaction('newuser', 100);
      expect(newBalance).toBe(100);
      expect(getUserBalance('newuser')).toBe(100);
    });
  });

  describe('idempotency (duplicate transactions)', () => {
    it('should initially report transaction as not duplicate', () => {
      expect(isDuplicateTransaction('tx123')).toBe(false);
    });

    it('should mark transaction as processed and report as duplicate', () => {
      markTransaction('tx456');
      expect(isDuplicateTransaction('tx456')).toBe(true);
    });

    it('should track multiple unique transactions', () => {
      markTransaction('tx1');
      markTransaction('tx2');
      expect(isDuplicateTransaction('tx1')).toBe(true);
      expect(isDuplicateTransaction('tx2')).toBe(true);
      expect(isDuplicateTransaction('tx3')).toBe(false);
    });
  });

  describe('clearStore', () => {
    it('should reset balances and transactions', () => {
      applyTransaction('testuser1', 1000);
      applyTransaction('tempuser', 50);
      markTransaction('temp-tx');

      clearStore();

      expect(getUserBalance('testuser1')).toBe(10000);
      expect(getUserBalance('tempuser')).toBe(0);
      expect(isDuplicateTransaction('temp-tx')).toBe(false);
    });
  });
});
