import { describe, expect, it } from 'vitest';
import { TAX_PRESETS, estimateSetAside } from '../src/lib/tax';

describe('TAX_PRESETS', () => {
  it('offers US and UK starting rates without encoding tax law', () => {
    expect(TAX_PRESETS.us.ratePercent).toBe(30);
    expect(TAX_PRESETS.us.periods).toBe(4);
    expect(TAX_PRESETS.uk.ratePercent).toBe(25);
    expect(TAX_PRESETS.uk.periods).toBe(2);
    expect(TAX_PRESETS.custom.ratePercent).toBe(25);
    expect(TAX_PRESETS.custom.periods).toBe(4);
  });
});

describe('estimateSetAside', () => {
  it('sets aside a percentage of profit and splits it across periods', () => {
    const result = estimateSetAside({
      incomeCents: 1_000_000,
      expenseCents: 400_000,
      ratePercent: 30,
      periods: 4,
    });
    expect(result.profitCents).toBe(600_000);
    expect(result.setAsideCents).toBe(180_000);
    expect(result.leftoverCents).toBe(420_000);
    expect(result.periodAmountCents).toBe(45_000);
    expect(result.isLoss).toBe(false);
  });

  it('rounds the set-aside to cents and keeps leftover consistent', () => {
    const result = estimateSetAside({
      incomeCents: 10_000,
      expenseCents: 0,
      ratePercent: 33.33,
      periods: 4,
    });
    expect(result.setAsideCents).toBe(3333);
    expect(result.leftoverCents).toBe(6667);
    expect(result.setAsideCents + result.leftoverCents).toBe(result.profitCents);
  });

  it('sets aside nothing on a loss and flags the loss', () => {
    const result = estimateSetAside({
      incomeCents: 100_000,
      expenseCents: 200_000,
      ratePercent: 30,
      periods: 4,
    });
    expect(result.profitCents).toBe(-100_000);
    expect(result.setAsideCents).toBe(0);
    expect(result.leftoverCents).toBe(-100_000);
    expect(result.periodAmountCents).toBe(0);
    expect(result.isLoss).toBe(true);
  });

  it('clamps the rate to 0–100', () => {
    const high = estimateSetAside({
      incomeCents: 10_000,
      expenseCents: 0,
      ratePercent: 150,
      periods: 4,
    });
    expect(high.setAsideCents).toBe(10_000);
    expect(high.leftoverCents).toBe(0);

    const low = estimateSetAside({
      incomeCents: 10_000,
      expenseCents: 0,
      ratePercent: -10,
      periods: 4,
    });
    expect(low.setAsideCents).toBe(0);
    expect(low.leftoverCents).toBe(10_000);
  });

  it('uses the full set-aside as the period amount when periods are less than 1', () => {
    const result = estimateSetAside({
      incomeCents: 10_000,
      expenseCents: 0,
      ratePercent: 40,
      periods: 0,
    });
    expect(result.setAsideCents).toBe(4000);
    expect(result.periodAmountCents).toBe(4000);
  });
});
