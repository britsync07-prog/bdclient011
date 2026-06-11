import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow the first request', () => {
    const key = 'test-1';
    const result = rateLimit(key, 2, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('should allow multiple requests within limit', () => {
    const key = 'test-2';
    rateLimit(key, 2, 1000);
    const result = rateLimit(key, 2, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should block requests exceeding limit', () => {
    const key = 'test-3';
    rateLimit(key, 2, 1000);
    rateLimit(key, 2, 1000);
    const result = rateLimit(key, 2, 1000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after the window has passed', () => {
    const key = 'test-4';
    const now = 1000;
    vi.setSystemTime(now);

    rateLimit(key, 1, 1000); // resetAt = 2000

    vi.setSystemTime(2001);
    const result = rateLimit(key, 1, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should reset exactly at the reset boundary', () => {
    const key = 'test-5';
    const now = 1000;
    vi.setSystemTime(now);

    rateLimit(key, 1, 1000); // resetAt = 2000

    vi.setSystemTime(2000);
    const result = rateLimit(key, 1, 1000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should handle different keys independently', () => {
    const key1 = 'test-6a';
    const key2 = 'test-6b';

    rateLimit(key1, 1, 1000);
    const result = rateLimit(key2, 1, 1000);

    expect(result.allowed).toBe(true);
  });

  it('should return correct resetAt time', () => {
    const key = 'test-7';
    const now = 1000;
    vi.setSystemTime(now);

    const result = rateLimit(key, 5, 1000);
    expect(result.resetAt).toBe(2000);

    vi.setSystemTime(1500);
    const result2 = rateLimit(key, 5, 1000);
    expect(result2.resetAt).toBe(2000);
  });
});
