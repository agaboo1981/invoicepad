import { PAYMENT_IS_PLACEHOLDER, PAYMENT_URL } from '../config';

const button = document.querySelector<HTMLAnchorElement>('[data-buy-button]');
const note = document.querySelector<HTMLElement>('[data-buy-note]');

if (button && !PAYMENT_IS_PLACEHOLDER) {
  button.href = PAYMENT_URL;
  button.textContent = 'Buy the organizer — $19';
  button.target = '_blank';
  button.rel = 'noopener noreferrer';
  button.removeAttribute('aria-disabled');
  note?.setAttribute('hidden', '');
} else if (button) {
  button.href = '#coming-soon';
  button.textContent = 'Coming soon';
  button.setAttribute('aria-disabled', 'true');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    note?.removeAttribute('hidden');
    note?.scrollIntoView({ block: 'nearest' });
  });
}

if (!PAYMENT_IS_PLACEHOLDER) {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data['@type'] === 'Product' && data.offers) {
        data.offers.url = PAYMENT_URL;
        data.offers.availability = 'https://schema.org/InStock';
        script.textContent = JSON.stringify(data);
      }
    } catch {
      // Leave the original JSON-LD in place if it cannot be parsed.
    }
  }
}
