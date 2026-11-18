import { PAYMENT_IS_PLACEHOLDER, PAYMENT_URL } from '../config';

const button = document.querySelector<HTMLAnchorElement>('[data-buy-button]');
const note = document.querySelector<HTMLElement>('[data-buy-note]');

if (button && !PAYMENT_IS_PLACEHOLDER) {
  button.href = PAYMENT_URL;
  button.removeAttribute('aria-disabled');
  note?.setAttribute('hidden', '');
} else if (button) {
  button.href = '#payment-link-pending';
  button.setAttribute('aria-disabled', 'true');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    note?.removeAttribute('hidden');
    note?.scrollIntoView({ block: 'nearest' });
  });
}
