import { CURRENCIES, currencyByCode, detectCurrency } from '../lib/currency';
import { formatMoney, parseAmount, toCents } from '../lib/money';
import { loadJson, saveJson } from '../lib/storage';
import {
  TAX_PRESETS,
  estimateSetAside,
  type TaxPresetId,
} from '../lib/tax';

const STORAGE_KEY = 'tax';
const STORAGE_VERSION = 1;

interface TaxDraft {
  income: string;
  expenses: string;
  currency: string;
  preset: TaxPresetId;
  ratePercent: number;
  periods: number;
}

function isPresetId(value: string): value is TaxPresetId {
  return value === 'us' || value === 'uk' || value === 'custom';
}

function defaultDraft(): TaxDraft {
  const currency = detectCurrency();
  const preset: TaxPresetId = currency.code === 'GBP' ? 'uk' : 'us';
  const config = TAX_PRESETS[preset];
  return {
    income: '0',
    expenses: '0',
    currency: currency.code,
    preset,
    ratePercent: config.ratePercent,
    periods: config.periods,
  };
}

function required<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element ${selector}`);
  return node;
}

export function mountTaxApp(root: HTMLElement): void {
  const form = required<HTMLFormElement>(root, '#tax-form');
  const currencySelect = required<HTMLSelectElement>(form, '#currencyTax');
  const presetSelect = required<HTMLSelectElement>(form, '#preset');
  const rateInput = required<HTMLInputElement>(form, '#ratePercent');
  const periodsInput = required<HTMLInputElement>(form, '#periods');
  const incomeInput = required<HTMLInputElement>(form, '#income');
  const expensesInput = required<HTMLInputElement>(form, '#expenses');
  const summary = required<HTMLElement>(form, '[data-preset-summary]');
  const periodLabel = required<HTMLElement>(root, '[data-period-label]');
  const lossNote = required<HTMLElement>(root, '[data-loss-note]');

  currencySelect.innerHTML = CURRENCIES.map(
    (item) => `<option value="${item.code}">${item.label}</option>`,
  ).join('');

  let draft = loadJson(window.localStorage, STORAGE_KEY, STORAGE_VERSION, defaultDraft());
  if (!isPresetId(draft.preset)) draft = { ...draft, preset: 'custom' };

  const paintForm = () => {
    incomeInput.value = draft.income;
    expensesInput.value = draft.expenses;
    currencySelect.value = draft.currency;
    presetSelect.value = draft.preset;
    rateInput.value = String(draft.ratePercent);
    periodsInput.value = String(draft.periods);
  };

  const paintResults = () => {
    const estimate = estimateSetAside({
      incomeCents: toCents(parseAmount(draft.income)),
      expenseCents: toCents(parseAmount(draft.expenses)),
      ratePercent: draft.ratePercent,
      periods: draft.periods,
    });
    const locale = currencyByCode(draft.currency).locale;
    const money = (cents: number) => formatMoney(cents, draft.currency, locale);
    const set = (key: string, cents: number) => {
      const node = root.querySelector(`[data-result="${key}"]`);
      if (node) node.textContent = money(cents);
    };
    set('profit', estimate.profitCents);
    set('setAside', estimate.setAsideCents);
    set('leftover', estimate.leftoverCents);
    set('period', estimate.periodAmountCents);
    const preset = TAX_PRESETS[draft.preset];
    summary.textContent = preset.summary;
    periodLabel.textContent = draft.periods === 4 ? 'Per quarter' : `Each of ${draft.periods} periods`;
    if (draft.preset === 'uk' && draft.periods === 2) periodLabel.textContent = 'Each instalment';
    const profitBox = root.querySelector('[data-result="profit"]')?.parentElement;
    profitBox?.classList.toggle('is-loss', estimate.isLoss);
    lossNote.hidden = !estimate.isLoss;
    saveJson(window.localStorage, STORAGE_KEY, STORAGE_VERSION, draft);
  };

  paintForm();
  paintResults();

  presetSelect.addEventListener('change', () => {
    const value = presetSelect.value;
    if (!isPresetId(value)) return;
    const preset = TAX_PRESETS[value];
    draft = {
      ...draft,
      preset: value,
      ratePercent: preset.ratePercent,
      periods: preset.periods,
    };
    paintForm();
    paintResults();
  });

  form.addEventListener('input', () => {
    draft = {
      ...draft,
      income: incomeInput.value,
      expenses: expensesInput.value,
      currency: currencySelect.value,
      ratePercent: parseAmount(rateInput.value),
      periods: Math.round(parseAmount(periodsInput.value)),
    };
    paintResults();
  });
}
