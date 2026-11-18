import { clampPercent } from './money';

export type TaxPresetId = 'us' | 'uk' | 'custom';

export interface TaxPreset {
  id: TaxPresetId;
  label: string;
  ratePercent: number;
  periods: number;
  periodLabel: string;
  summary: string;
}

export const TAX_PRESETS: Record<TaxPresetId, TaxPreset> = {
  us: {
    id: 'us',
    label: 'United States freelancer',
    ratePercent: 30,
    periods: 4,
    periodLabel: 'quarterly set-aside',
    summary:
      'A starting point of 30%, split into four quarterly amounts. This is not a calculation of federal, state, or self-employment tax.',
  },
  uk: {
    id: 'uk',
    label: 'United Kingdom sole trader',
    ratePercent: 25,
    periods: 2,
    periodLabel: 'instalment set-aside',
    summary:
      'A starting point of 25%, split into two amounts, in the spirit of payments on account. This is not a Self Assessment calculation.',
  },
  custom: {
    id: 'custom',
    label: 'Custom rate',
    ratePercent: 25,
    periods: 4,
    periodLabel: 'period set-aside',
    summary:
      'Set any rate and any number of periods. Use this if you work in another country or already know the rate you want to reserve.',
  },
};

export interface TaxEstimateInput {
  incomeCents: number;
  expenseCents: number;
  ratePercent: number;
  periods: number;
}

export interface TaxEstimate {
  profitCents: number;
  setAsideCents: number;
  leftoverCents: number;
  periodAmountCents: number;
  isLoss: boolean;
}

export function estimateSetAside(input: TaxEstimateInput): TaxEstimate {
  const incomeCents = Number.isFinite(input.incomeCents) ? Math.round(input.incomeCents) : 0;
  const expenseCents = Number.isFinite(input.expenseCents) ? Math.round(input.expenseCents) : 0;
  const profitCents = incomeCents - expenseCents;
  const isLoss = profitCents < 0;
  const ratePercent = clampPercent(input.ratePercent);

  if (isLoss) {
    return {
      profitCents,
      setAsideCents: 0,
      leftoverCents: profitCents,
      periodAmountCents: 0,
      isLoss: true,
    };
  }

  const setAsideCents = Math.round((profitCents * ratePercent) / 100);
  const leftoverCents = profitCents - setAsideCents;
  const periods = input.periods;
  const periodAmountCents =
    Number.isFinite(periods) && periods >= 1
      ? Math.round(setAsideCents / periods)
      : setAsideCents;

  return {
    profitCents,
    setAsideCents,
    leftoverCents,
    periodAmountCents,
    isLoss: false,
  };
}
