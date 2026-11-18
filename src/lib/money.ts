/** Convert a decimal major-unit amount to integer minor units (cents). */
export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  const epsilon = amount >= 0 ? 1e-8 : -1e-8;
  return Math.round(amount * 100 + epsilon);
}

export function fromCents(cents: number): number {
  if (!Number.isFinite(cents)) return 0;
  return cents / 100;
}

export function formatMoney(
  cents: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(fromCents(cents));
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function parseAmount(raw: string): number {
  const trimmed = raw.trim().replace(/,/g, '');
  if (trimmed === '') return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : 0;
}
