import { describe, expect, it } from 'vitest';
import { formatMoney, fromCents, toCents } from '../src/lib/money';

describe('toCents', () => {
  it('converts a decimal amount to integer cents', () => {
    expect(toCents(19)).toBe(1900);
    expect(toCents(19.99)).toBe(1999);
  });

  it('rounds half up to the nearest cent', () => {
    expect(toCents(1.005)).toBe(101);
    expect(toCents(2.665)).toBe(267);
  });

  it('returns 0 for non-finite values', () => {
    expect(toCents(Number.NaN)).toBe(0);
    expect(toCents(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('fromCents', () => {
  it('converts integer cents back to a decimal amount', () => {
    expect(fromCents(1999)).toBe(19.99);
    expect(fromCents(0)).toBe(0);
  });
});

describe('formatMoney', () => {
  it('formats USD using the given locale', () => {
    expect(formatMoney(1999, 'USD', 'en-US')).toBe('$19.99');
  });

  it('formats GBP using a British locale', () => {
    expect(formatMoney(150000, 'GBP', 'en-GB')).toBe('£1,500.00');
  });
});
