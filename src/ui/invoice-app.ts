import { CURRENCIES, currencyByCode, detectCurrency } from '../lib/currency';
import { createId } from '../lib/id';
import {
  calculateInvoice,
  lineTotalCents,
  type InvoiceLine,
} from '../lib/invoice';
import { formatMoney, parseAmount, toCents } from '../lib/money';
import { loadJson, removeJson, saveJson } from '../lib/storage';

const STORAGE_KEY = 'invoice';
const STORAGE_VERSION = 1;
const MAX_LOGO_BYTES = 180_000;

export interface InvoiceDraft {
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  toName: string;
  toEmail: string;
  toAddress: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  lines: InvoiceLine[];
  discountPercent: number;
  taxRatePercent: number;
  taxInclusive: boolean;
  notes: string;
  paymentDetails: string;
  logoDataUrl: string;
}

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function plusDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function formatDate(iso: string, locale: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function emptyLine(): InvoiceLine {
  return { id: createId(), description: '', quantity: 1, unitPriceCents: 0 };
}

export function defaultDraft(): InvoiceDraft {
  const currency = detectCurrency();
  const issueDate = isoDate(new Date());
  return {
    fromName: '',
    fromEmail: '',
    fromAddress: '',
    toName: '',
    toEmail: '',
    toAddress: '',
    invoiceNumber: 'INV-0001',
    issueDate,
    dueDate: plusDays(issueDate, 14),
    currency: currency.code,
    lines: [emptyLine()],
    discountPercent: 0,
    taxRatePercent: 0,
    taxInclusive: false,
    notes: '',
    paymentDetails: '',
    logoDataUrl: '',
  };
}

function required<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element ${selector}`);
  return node;
}

function input(root: ParentNode, name: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return required(root, `#${name}`);
}

function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const url = String(reader.result ?? '');
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 480 / Math.max(image.width, 1));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(url);
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed.length > MAX_LOGO_BYTES ? url.slice(0, MAX_LOGO_BYTES) : compressed);
      };
      image.onerror = () => resolve(url);
      image.src = url;
    };
    reader.readAsDataURL(file);
  });
}

function renderPreview(draft: InvoiceDraft): string {
  const locale = currencyByCode(draft.currency).locale;
  const money = (cents: number) => formatMoney(cents, draft.currency, locale);
  const totals = calculateInvoice(draft);
  const lines = draft.lines
    .map((line) => {
      const total = lineTotalCents(line.quantity, line.unitPriceCents);
      const description = line.description.trim() || '—';
      return `<tr>
        <td>${escapeHtml(description)}</td>
        <td>${escapeHtml(String(line.quantity))}</td>
        <td>${escapeHtml(money(line.unitPriceCents))}</td>
        <td>${escapeHtml(money(total))}</td>
      </tr>`;
    })
    .join('');

  const logo = draft.logoDataUrl
    ? `<img class="paper__logo" src="${escapeAttr(draft.logoDataUrl)}" alt="" />`
    : '';

  const from = [draft.fromName, draft.fromEmail, draft.fromAddress].filter(Boolean).join('\n');
  const to = [draft.toName, draft.toEmail, draft.toAddress].filter(Boolean).join('\n');
  const notes = [draft.notes, draft.paymentDetails].filter((part) => part.trim()).join('\n\n');

  return `
    <div class="paper__top">
      <div>${logo}</div>
      <div>
        <p class="paper__title">Invoice</p>
        <p class="paper__number">${escapeHtml(draft.invoiceNumber || '—')}</p>
      </div>
    </div>
    <div class="parties">
      <div>
        <h3>From</h3>
        <p>${escapeHtml(from || 'Your details')}</p>
      </div>
      <div>
        <h3>Bill to</h3>
        <p>${escapeHtml(to || 'Client details')}</p>
      </div>
    </div>
    <div class="meta-dates">
      <div>Issued ${escapeHtml(formatDate(draft.issueDate, locale) || '—')}</div>
      <div>Due ${escapeHtml(formatDate(draft.dueDate, locale) || '—')}</div>
    </div>
    <table class="items">
      <thead>
        <tr><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
      </thead>
      <tbody>${lines}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${escapeHtml(money(totals.subtotalCents))}</span></div>
      ${totals.discountCents ? `<div><span>Discount</span><span>−${escapeHtml(money(totals.discountCents))}</span></div>` : ''}
      ${totals.taxCents ? `<div><span>${draft.taxInclusive ? 'Tax included' : 'Tax'}</span><span>${escapeHtml(money(totals.taxCents))}</span></div>` : ''}
      <div class="totals__grand"><span>Total</span><span>${escapeHtml(money(totals.totalCents))}</span></div>
    </div>
    ${notes ? `<div class="paper__notes">${escapeHtml(notes)}</div>` : ''}
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\n', '<br />');
}

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function renderLines(list: HTMLElement, draft: InvoiceDraft): void {
  const locale = currencyByCode(draft.currency).locale;
  list.innerHTML = draft.lines
    .map((line, index) => {
      const total = formatMoney(
        lineTotalCents(line.quantity, line.unitPriceCents),
        draft.currency,
        locale,
      );
      return `<div class="line-row" data-line-id="${escapeAttr(line.id)}">
        <div class="field">
          <label for="line-desc-${index}">Description</label>
          <input id="line-desc-${index}" data-field="description" type="text" value="${escapeAttr(line.description)}" />
        </div>
        <div class="field">
          <label for="line-qty-${index}">Qty</label>
          <input id="line-qty-${index}" data-field="quantity" type="number" min="0" step="0.25" value="${escapeAttr(String(line.quantity))}" />
        </div>
        <div class="field">
          <label for="line-price-${index}">Price</label>
          <input id="line-price-${index}" data-field="unitPrice" type="text" inputmode="decimal" value="${escapeAttr(String(line.unitPriceCents / 100))}" />
        </div>
        <div class="line-row__total" aria-label="Line total">${escapeHtml(total)}</div>
        <button class="button button--ghost" type="button" data-remove-line>Remove</button>
      </div>`;
    })
    .join('');
}

function readDraftFromForm(form: HTMLFormElement, current: InvoiceDraft): InvoiceDraft {
  const get = (name: string) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      return field.value;
    }
    return '';
  };
  const lines = current.lines.map((line) => {
    const row = form.querySelector(`[data-line-id="${CSS.escape(line.id)}"]`);
    if (!row) return line;
    const description = row.querySelector<HTMLInputElement>('[data-field="description"]')?.value ?? '';
    const quantity = parseAmount(row.querySelector<HTMLInputElement>('[data-field="quantity"]')?.value ?? '0');
    const unitPriceCents = toCents(parseAmount(row.querySelector<HTMLInputElement>('[data-field="unitPrice"]')?.value ?? '0'));
    return { ...line, description, quantity, unitPriceCents };
  });
  return {
    ...current,
    fromName: get('fromName'),
    fromEmail: get('fromEmail'),
    fromAddress: get('fromAddress'),
    toName: get('toName'),
    toEmail: get('toEmail'),
    toAddress: get('toAddress'),
    invoiceNumber: get('invoiceNumber'),
    issueDate: get('issueDate'),
    dueDate: get('dueDate'),
    currency: get('currency') || current.currency,
    discountPercent: parseAmount(get('discountPercent')),
    taxRatePercent: parseAmount(get('taxRatePercent')),
    taxInclusive: Boolean(
      form.elements.namedItem('taxInclusive') instanceof HTMLInputElement &&
        (form.elements.namedItem('taxInclusive') as HTMLInputElement).checked,
    ),
    notes: get('notes'),
    paymentDetails: get('paymentDetails'),
    lines,
  };
}

function writeDraftToForm(form: HTMLFormElement, draft: InvoiceDraft): void {
  const assign = (name: string, value: string | boolean) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      field.checked = Boolean(value);
      return;
    }
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
      field.value = String(value);
    }
  };
  assign('fromName', draft.fromName);
  assign('fromEmail', draft.fromEmail);
  assign('fromAddress', draft.fromAddress);
  assign('toName', draft.toName);
  assign('toEmail', draft.toEmail);
  assign('toAddress', draft.toAddress);
  assign('invoiceNumber', draft.invoiceNumber);
  assign('issueDate', draft.issueDate);
  assign('dueDate', draft.dueDate);
  assign('currency', draft.currency);
  assign('discountPercent', String(draft.discountPercent));
  assign('taxRatePercent', String(draft.taxRatePercent));
  assign('taxInclusive', draft.taxInclusive);
  assign('notes', draft.notes);
  assign('paymentDetails', draft.paymentDetails);
}

export function mountInvoiceApp(root: HTMLElement): void {
  const form = required<HTMLFormElement>(root, '#invoice-form');
  const list = required<HTMLElement>(root, '[data-line-list]');
  const preview = required<HTMLElement>(root, '[data-invoice-preview]');
  const total = required<HTMLElement>(document, '[data-invoice-total]');
  const currencySelect = input(form, 'currency') as HTMLSelectElement;
  currencySelect.innerHTML = CURRENCIES.map(
    (item) => `<option value="${item.code}">${item.label}</option>`,
  ).join('');

  let draft = loadJson(window.localStorage, STORAGE_KEY, STORAGE_VERSION, defaultDraft());
  if (draft.lines.length === 0) draft = { ...draft, lines: [emptyLine()] };

  const persistAndPaint = (next: InvoiceDraft, rebuildLines = false) => {
    draft = next;
    saveJson(window.localStorage, STORAGE_KEY, STORAGE_VERSION, draft);
    if (rebuildLines) renderLines(list, draft);
    preview.innerHTML = renderPreview(draft);
    const locale = currencyByCode(draft.currency).locale;
    const totals = calculateInvoice(draft);
    total.textContent = formatMoney(totals.totalCents, draft.currency, locale);
  };

  writeDraftToForm(form, draft);
  renderLines(list, draft);
  persistAndPaint(draft);

  const paintFromForm = () => {
    persistAndPaint(readDraftFromForm(form, draft), false);
    const locale = currencyByCode(draft.currency).locale;
    for (const row of list.querySelectorAll<HTMLElement>('[data-line-id]')) {
      const id = row.getAttribute('data-line-id');
      const line = draft.lines.find((item) => item.id === id);
      const totalNode = row.querySelector('.line-row__total');
      if (line && totalNode) {
        totalNode.textContent = formatMoney(
          lineTotalCents(line.quantity, line.unitPriceCents),
          draft.currency,
          locale,
        );
      }
    }
  };

  form.addEventListener('input', paintFromForm);
  form.addEventListener('change', paintFromForm);

  root.querySelector('[data-add-line]')?.addEventListener('click', () => {
    persistAndPaint({ ...readDraftFromForm(form, draft), lines: [...draft.lines, emptyLine()] }, true);
  });

  list.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest('[data-remove-line]');
    if (!(button instanceof HTMLElement)) return;
    const row = button.closest('[data-line-id]');
    const id = row?.getAttribute('data-line-id');
    if (!id) return;
    const current = readDraftFromForm(form, draft);
    const lines = current.lines.filter((line) => line.id !== id);
    persistAndPaint({ ...current, lines: lines.length ? lines : [emptyLine()] }, true);
  });

  const logo = form.querySelector<HTMLInputElement>('#logo');
  logo?.addEventListener('change', async () => {
    const file = logo.files?.[0];
    if (!file) return;
    try {
      const logoDataUrl = await readLogo(file);
      persistAndPaint({ ...readDraftFromForm(form, draft), logoDataUrl });
    } catch {
      logo.value = '';
    }
  });

  document.querySelector('[data-print-invoice]')?.addEventListener('click', () => {
    window.print();
  });

  document.querySelector('[data-reset-invoice]')?.addEventListener('click', () => {
    if (!window.confirm('Clear this invoice draft from this browser?')) return;
    removeJson(window.localStorage, STORAGE_KEY);
    logo && (logo.value = '');
    const next = defaultDraft();
    writeDraftToForm(form, next);
    persistAndPaint(next, true);
  });
}
