import { describe, expect, it } from 'vitest';
import { calculateInvoice, lineTotalCents } from '../src/lib/invoice';

const emptyRates = {
  discountPercent: 0,
  taxRatePercent: 0,
  taxInclusive: false,
} as const;

describe('lineTotalCents', () => {
  it('multiplies quantity by unit price and rounds to the nearest cent', () => {
    expect(lineTotalCents(2, 10000)).toBe(20000);
    expect(lineTotalCents(1.5, 8000)).toBe(12000);
    expect(lineTotalCents(1 / 3, 100)).toBe(33);
  });

  it('treats negative or non-finite quantity or price as zero', () => {
    expect(lineTotalCents(-2, 10000)).toBe(0);
    expect(lineTotalCents(2, -100)).toBe(0);
    expect(lineTotalCents(Number.NaN, 100)).toBe(0);
  });
});

describe('calculateInvoice', () => {
  it('returns zeros when there are no line items', () => {
    expect(calculateInvoice({ lines: [], ...emptyRates })).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      afterDiscountCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  });

  it('sums rounded line totals as the subtotal', () => {
    const result = calculateInvoice({
      lines: [
        { id: 'a', description: 'Design', quantity: 2, unitPriceCents: 10000 },
        { id: 'b', description: 'Hours', quantity: 1.5, unitPriceCents: 8000 },
      ],
      ...emptyRates,
    });
    expect(result.subtotalCents).toBe(32000);
    expect(result.totalCents).toBe(32000);
  });

  it('applies a percent discount to the subtotal before tax', () => {
    const result = calculateInvoice({
      lines: [{ id: 'a', description: 'Work', quantity: 1, unitPriceCents: 10000 }],
      discountPercent: 10,
      taxRatePercent: 20,
      taxInclusive: false,
    });
    expect(result.subtotalCents).toBe(10000);
    expect(result.discountCents).toBe(1000);
    expect(result.afterDiscountCents).toBe(9000);
    expect(result.taxCents).toBe(1800);
    expect(result.totalCents).toBe(10800);
  });

  it('rounds the discount so the remaining cents still add up', () => {
    const result = calculateInvoice({
      lines: [{ id: 'a', description: 'Work', quantity: 1, unitPriceCents: 9999 }],
      discountPercent: 10,
      taxRatePercent: 0,
      taxInclusive: false,
    });
    expect(result.discountCents).toBe(1000);
    expect(result.afterDiscountCents).toBe(8999);
    expect(result.totalCents).toBe(8999);
  });

  it('adds exclusive tax after the discount', () => {
    const result = calculateInvoice({
      lines: [{ id: 'a', description: 'Work', quantity: 1, unitPriceCents: 10000 }],
      discountPercent: 0,
      taxRatePercent: 20,
      taxInclusive: false,
    });
    expect(result.taxCents).toBe(2000);
    expect(result.totalCents).toBe(12000);
  });

  it('extracts inclusive tax from the discounted total', () => {
    const result = calculateInvoice({
      lines: [{ id: 'a', description: 'Work', quantity: 1, unitPriceCents: 12000 }],
      discountPercent: 0,
      taxRatePercent: 20,
      taxInclusive: true,
    });
    expect(result.afterDiscountCents).toBe(12000);
    expect(result.taxCents).toBe(2000);
    expect(result.totalCents).toBe(12000);
  });

  it('clamps discount and tax rates into 0–100', () => {
    const high = calculateInvoice({
      lines: [{ id: 'a', description: 'Work', quantity: 1, unitPriceCents: 5000 }],
      discountPercent: 150,
      taxRatePercent: 200,
      taxInclusive: false,
    });
    expect(high.discountCents).toBe(5000);
    expect(high.afterDiscountCents).toBe(0);
    expect(high.taxCents).toBe(0);
    expect(high.totalCents).toBe(0);

    const low = calculateInvoice({
      lines: [{ id: 'a', description: 'Work', quantity: 1, unitPriceCents: 5000 }],
      discountPercent: -10,
      taxRatePercent: -5,
      taxInclusive: false,
    });
    expect(low.discountCents).toBe(0);
    expect(low.taxCents).toBe(0);
    expect(low.totalCents).toBe(5000);
  });
});
