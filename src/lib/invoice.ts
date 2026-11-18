import { clampPercent } from './money';

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface InvoiceInput {
  lines: readonly InvoiceLine[];
  discountPercent: number;
  taxRatePercent: number;
  taxInclusive: boolean;
}

export interface InvoiceTotals {
  subtotalCents: number;
  discountCents: number;
  afterDiscountCents: number;
  taxCents: number;
  totalCents: number;
}

export function lineTotalCents(quantity: number, unitPriceCents: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPriceCents)) return 0;
  if (quantity <= 0 || unitPriceCents <= 0) return 0;
  return Math.round(quantity * unitPriceCents);
}

export function calculateInvoice(input: InvoiceInput): InvoiceTotals {
  const subtotalCents = input.lines.reduce(
    (sum, line) => sum + lineTotalCents(line.quantity, line.unitPriceCents),
    0,
  );
  const discountPercent = clampPercent(input.discountPercent);
  const taxRatePercent = clampPercent(input.taxRatePercent);
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  const afterDiscountCents = subtotalCents - discountCents;

  if (taxRatePercent === 0) {
    return {
      subtotalCents,
      discountCents,
      afterDiscountCents,
      taxCents: 0,
      totalCents: afterDiscountCents,
    };
  }

  if (input.taxInclusive) {
    const netCents = Math.round(afterDiscountCents / (1 + taxRatePercent / 100));
    const taxCents = afterDiscountCents - netCents;
    return {
      subtotalCents,
      discountCents,
      afterDiscountCents,
      taxCents,
      totalCents: afterDiscountCents,
    };
  }

  const taxCents = Math.round((afterDiscountCents * taxRatePercent) / 100);
  return {
    subtotalCents,
    discountCents,
    afterDiscountCents,
    taxCents,
    totalCents: afterDiscountCents + taxCents,
  };
}
