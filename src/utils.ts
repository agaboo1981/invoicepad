import { InvoiceData } from './types';

export const CURRENCIES = [
  { code: 'USD', locale: 'en-US', label: 'USD - US Dollar (English)' },
  { code: 'EUR', locale: 'de-DE', label: 'EUR - Euro (German)' },
  { code: 'EUR', locale: 'fr-FR', label: 'EUR - Euro (French)' },
  { code: 'EUR', locale: 'es-ES', label: 'EUR - Euro (Spanish)' },
  { code: 'EUR', locale: 'it-IT', label: 'EUR - Euro (Italian)' },
  { code: 'JPY', locale: 'ja-JP', label: 'JPY - Japanese Yen (Japanese)' },
  { code: 'GBP', locale: 'en-GB', label: 'GBP - British Pound (English)' },
  { code: 'AUD', locale: 'en-AU', label: 'AUD - Australian Dollar (English)' },
  { code: 'CAD', locale: 'en-CA', label: 'CAD - Canadian Dollar (English)' },
  { code: 'CHF', locale: 'de-CH', label: 'CHF - Swiss Franc (German)' },
  { code: 'CNY', locale: 'zh-CN', label: 'CNY - Chinese Yuan (Chinese)' },
  { code: 'HKD', locale: 'zh-HK', label: 'HKD - Hong Kong Dollar (Chinese)' },
  { code: 'NZD', locale: 'en-NZ', label: 'NZD - New Zealand Dollar (English)' },
  { code: 'SEK', locale: 'sv-SE', label: 'SEK - Swedish Krona (Swedish)' },
  { code: 'KRW', locale: 'ko-KR', label: 'KRW - South Korean Won (Korean)' },
  { code: 'SGD', locale: 'en-SG', label: 'SGD - Singapore Dollar (English)' },
  { code: 'NOK', locale: 'nb-NO', label: 'NOK - Norwegian Krone (Norwegian)' },
  { code: 'MXN', locale: 'es-MX', label: 'MXN - Mexican Peso (Spanish)' },
  { code: 'INR', locale: 'hi-IN', label: 'INR - Indian Rupee (Hindi)' },
  { code: 'RUB', locale: 'ru-RU', label: 'RUB - Russian Ruble (Russian)' },
  { code: 'ZAR', locale: 'en-ZA', label: 'ZAR - South African Rand (English)' },
  { code: 'TRY', locale: 'tr-TR', label: 'TRY - Turkish Lira (Turkish)' },
  { code: 'BRL', locale: 'pt-BR', label: 'BRL - Brazilian Real (Portuguese)' }
];

export const formatCurrency = (amount: number, currencyCode: string, locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

export const generateId = () =>
  Math.random().toString(36).substring(2, 9);

export const calculateTotals = (data: InvoiceData) => {
  const sumItems = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount = sumItems * (data.discount / 100);
  const afterDiscount = sumItems - discountAmount;
  
  let taxAmount = 0;
  let total = 0;
  let subtotal = sumItems;

  if (data.isTaxInclusive) {
    taxAmount = afterDiscount - (afterDiscount / (1 + data.taxRate / 100));
    total = afterDiscount;
  } else {
    taxAmount = afterDiscount * (data.taxRate / 100);
    total = afterDiscount + taxAmount;
  }

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};
