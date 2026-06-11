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

  describe('getUserBalance', () => {
    it('should return the balance for an existing user', () => {
      expect(getUserBalance('testuser1')).toBe(10000);
    });

    it('should return 0 for a non-existent user', () => {
      expect(getUserBalance('nonexistent')).toBe(0);
    });
  });

  describe('applyTransaction', () => {
    it('should increase the balance for a positive amount', () => {
      const newBalance = applyTransaction('testuser1', 500);
      expect(newBalance).toBe(10500);
      expect(getUserBalance('testuser1')).toBe(10500);
    });

    it('should decrease the balance for a negative amount', () => {
      const newBalance = applyTransaction('testuser1', -500);
      expect(newBalance).toBe(9500);
      expect(getUserBalance('testuser1')).toBe(9500);
    });

    it('should allow balance to go negative (as per current implementation)', () => {
      const newBalance = applyTransaction('testuser1', -15000);
      expect(newBalance).toBe(-5000);
      expect(getUserBalance('testuser1')).toBe(-5000);
    });

    it('should initialize balance for a new user and apply transaction', () => {
      const newBalance = applyTransaction('newuser', 100);
      expect(newBalance).toBe(100);
      expect(getUserBalance('newuser')).toBe(100);
    });
  });

  describe('idempotency logic', () => {
    it('should correctly identify non-duplicate transactions', () => {
      expect(isDuplicateTransaction('tx123')).toBe(false);
    });

    it('should correctly identify duplicate transactions after marking', () => {
      markTransaction('tx123');
      expect(isDuplicateTransaction('tx123')).toBe(true);
    });

    it('should not affect other transaction codes', () => {
      markTransaction('tx123');
      expect(isDuplicateTransaction('tx456')).toBe(false);
    });
  });

  describe('resetStore', () => {
    it('should reset balances and processed transactions', () => {
      applyTransaction('testuser1', 500);
      applyTransaction('newuser', 100);
      markTransaction('tx123');

      resetStore();

      expect(getUserBalance('testuser1')).toBe(10000);
      expect(getUserBalance('newuser')).toBe(0);
      expect(isDuplicateTransaction('tx123')).toBe(false);
    });
  });
});
