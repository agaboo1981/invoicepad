import { mountTaxApp } from '../ui/tax-app';

const root = document.querySelector<HTMLElement>('[data-tax-app]');
if (root) mountTaxApp(root);
