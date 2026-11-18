import { mountInvoiceApp } from '../ui/invoice-app';

const root = document.querySelector<HTMLElement>('[data-invoice-app]');
if (root) mountInvoiceApp(root);
