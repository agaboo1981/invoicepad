export interface CurrencyOption {
  code: string;
  locale: string;
  label: string;
}

export const CURRENCIES: readonly CurrencyOption[] = [
  { code: 'USD', locale: 'en-US', label: 'USD — US dollar' },
  { code: 'GBP', locale: 'en-GB', label: 'GBP — British pound' },
  { code: 'EUR', locale: 'en-IE', label: 'EUR — Euro' },
  { code: 'CAD', locale: 'en-CA', label: 'CAD — Canadian dollar' },
  { code: 'AUD', locale: 'en-AU', label: 'AUD — Australian dollar' },
  { code: 'NZD', locale: 'en-NZ', label: 'NZD — New Zealand dollar' },
  { code: 'CHF', locale: 'de-CH', label: 'CHF — Swiss franc' },
  { code: 'SEK', locale: 'sv-SE', label: 'SEK — Swedish krona' },
  { code: 'NOK', locale: 'nb-NO', label: 'NOK — Norwegian krone' },
  { code: 'DKK', locale: 'da-DK', label: 'DKK — Danish krone' },
  { code: 'INR', locale: 'en-IN', label: 'INR — Indian rupee' },
  { code: 'SGD', locale: 'en-SG', label: 'SGD — Singapore dollar' },
  { code: 'JPY', locale: 'ja-JP', label: 'JPY — Japanese yen' },
  { code: 'ZAR', locale: 'en-ZA', label: 'ZAR — South African rand' },
  { code: 'BRL', locale: 'pt-BR', label: 'BRL — Brazilian real' },
  { code: 'MXN', locale: 'es-MX', label: 'MXN — Mexican peso' },
  { code: 'NGN', locale: 'en-NG', label: 'NGN — Nigerian naira' },
];

export function currencyByCode(code: string): CurrencyOption {
  return CURRENCIES.find((item) => item.code === code) ?? CURRENCIES[0]!;
}

export function detectCurrency(): CurrencyOption {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const exact = CURRENCIES.find((item) => item.locale === locale);
  if (exact) return exact;
  const language = locale.split('-')[0]?.toLowerCase();
  const partial = CURRENCIES.find((item) =>
    item.locale.toLowerCase().startsWith(`${language}`),
  );
  return partial ?? CURRENCIES[0]!;
}
