const fallbackSiteUrl = 'https://invoicepad.shop';

export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? fallbackSiteUrl).replace(
  /\/$/,
  '',
);

export const ORGANIZER_PRICE_USD = 19;
export const ORGANIZER_PRICE_LABEL = '$19';

const payment = import.meta.env.VITE_PAYMENT_URL ?? '';

export const PAYMENT_URL = payment.trim();
export const PAYMENT_IS_PLACEHOLDER = PAYMENT_URL.length === 0;
export const CONTACT_EMAIL = 'giganticjoshua@gmail.com';
