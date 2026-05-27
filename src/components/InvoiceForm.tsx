import React, { useRef } from 'react';
import { Plus, Trash2, Upload, X, UploadCloud } from 'lucide-react';
import { InvoiceData, InvoiceItem } from '../types';
import { generateId, CURRENCIES } from '../utils';
import { useTranslation } from '../i18n';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export function InvoiceForm({ data, onChange }: InvoiceFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslation(data.locale);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('signature', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateField = (field: keyof InvoiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = CURRENCIES[e.target.selectedIndex];
    if (selected) {
      onChange({ ...data, currency: selected.code, locale: selected.locale });
    }
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split(/\r?\n/).filter(row => row.trim() !== '');
      
      const newItems = rows.map(row => {
        // Simple CSV splitter, doesn't handle escaped quotes.
        const cols = row.split(',').map(col => col.trim());
        const description = cols[0] || 'Imported item';
        const quantity = parseFloat(cols[1]) || 1;
        const price = parseFloat(cols[2]) || 0;
        return { id: generateId(), description, quantity, price };
      });
      
      // If the first row seems to be a header (e.g. qty is NaN), remove it
      if (newItems.length > 0 && isNaN(parseFloat(rows[0].split(',')[1]))) {
        newItems.shift();
      }

      onChange({ ...data, items: [...data.items, ...newItems] });
      
      // Reset input so the same file could be selected again
      if (csvInputRef.current) csvInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const addItem = () => {
    const newItem: InvoiceItem = { id: generateId(), description: '', quantity: 1, price: 0 };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: updatedItems });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  const labelClass = "block text-[10px] uppercase font-bold text-gray-500 dark:text-zinc-500 tracking-widest mb-1.5";
  const inputClass = "w-full min-h-11 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-base sm:text-sm rounded-none focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-zinc-900 transition-shadow text-black dark:text-white";

  return (
    <div className="space-y-8 sm:space-y-10">
      
      {/* Details Section */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 dark:border-zinc-800 pb-2 text-black dark:text-white">{t('branding')}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClass}>{t('companyName')}</label>
            <input type="text" value={data.companyName || ''} onChange={(e) => updateField('companyName', e.target.value)} className={inputClass} placeholder="Acme Corp" />
          </div>
          <div>
            <label className={labelClass}>{t('logo')}</label>
            {data.logo ? (
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900 p-4 border border-gray-200 dark:border-zinc-800">
                <img src={data.logo} alt={t('logo')} className="h-12 object-contain" />
                <button 
                  type="button" 
                  onClick={() => updateField('logo', '')}
                  className="text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
                  title="Remove Logo"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-11 flex justify-center items-center gap-2 border border-dashed border-gray-300 dark:border-zinc-700 px-4 py-2 text-base sm:text-sm text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-zinc-500 transition-colors bg-white dark:bg-zinc-900 font-medium"
                >
                  <Upload size={16} /> {t('uploadLogo')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('invoiceNumber')}</label>
            <input type="text" value={data.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} className={inputClass} placeholder="INV-001" />
          </div>
          <div>
            <label className={labelClass}>{t('pdfFilename')}</label>
            <input type="text" value={data.pdfFileName || ''} onChange={(e) => updateField('pdfFileName', e.target.value)} className={inputClass} placeholder="e.g. Invoice_0001" />
          </div>
          <div>
            <label className={labelClass}>{t('currencyRegion')}</label>
            <select 
              value={`${data.currency}-${data.locale}`} 
              onChange={handleCurrencyChange} 
              className={inputClass}
            >
              {CURRENCIES.map(curr => (
                <option key={`${curr.code}-${curr.locale}`} value={`${curr.code}-${curr.locale}`}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('issueDate')}</label>
            <input type="date" value={data.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('dueDate')}</label>
            <input type="date" value={data.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} className={inputClass} />
          </div>
        </div>
      </section>

      {/* Parties Section */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 dark:border-zinc-800 pb-2 text-black dark:text-white">{t('parties')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('from')}</label>
            <textarea value={data.fromDetails} onChange={(e) => updateField('fromDetails', e.target.value)} className={`${inputClass} resize-none h-32 leading-relaxed`} placeholder="..." />
          </div>
          <div>
            <label className={labelClass}>{t('to')}</label>
            <textarea value={data.toDetails} onChange={(e) => updateField('toDetails', e.target.value)} className={`${inputClass} resize-none h-32 leading-relaxed`} placeholder="..." />
          </div>
        </div>
      </section>

      {/* Line Items Section */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-2 gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">{t('lineItems')}</h2>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={csvInputRef} 
              onChange={handleCsvImport} 
            />
            <button type="button" onClick={() => csvInputRef.current?.click()} className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors min-h-11 px-2">
              <UploadCloud size={14} /> {t('importCsv')}
            </button>
            <button type="button" onClick={addItem} className="text-black dark:text-white hover:text-gray-600 dark:hover:text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors min-h-11 px-2">
              <Plus size={14} /> {t('addItem')}
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {data.items.map((item, index) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-gray-50 dark:bg-zinc-900 p-4 border border-gray-200 dark:border-zinc-800 relative group">
              <div className="w-full sm:flex-grow">
                <label className={labelClass}>{t('itemDesc')}</label>
                <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className={inputClass} placeholder="..." />
              </div>
              <div className="w-full sm:w-24">
                <label className={labelClass}>{t('qty')}</label>
                <input type="number" min="0" step="any" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <div className="w-full sm:w-32">
                <label className={labelClass}>{t('price')}</label>
                <input type="number" min="0" step="any" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
              <button type="button" onClick={() => removeItem(item.id)} className="absolute top-1 right-1 sm:static sm:mb-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 transition-colors min-h-11 min-w-11 inline-flex items-center justify-center" title="Remove Item">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {data.items.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-zinc-500 border border-dashed border-gray-300 dark:border-zinc-700">
              {t('noItems')}
            </div>
          )}
        </div>
      </section>

      {/* Taxes & Notes */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 dark:border-zinc-800 pb-2 text-black dark:text-white">{t('additionalInfo')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('taxRate')}</label>
            <input type="number" min="0" step="0.1" value={data.taxRate} onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)} className={inputClass} />
            <label className="flex items-center gap-2 mt-3 cursor-pointer">
              <input type="checkbox" checked={data.isTaxInclusive || false} onChange={(e) => updateField('isTaxInclusive', e.target.checked)} className="w-4 h-4 accent-black dark:accent-white shrink-0" />
              <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">{t('taxInclusive')}</span>
            </label>
          </div>
          <div>
            <label className={labelClass}>{t('discount')}</label>
            <input type="number" min="0" step="0.1" value={data.discount} onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t('paymentUri')}</label>
            <input type="text" value={data.paymentQrLink || ''} onChange={(e) => updateField('paymentQrLink', e.target.value)} className={inputClass} placeholder="e.g. https://paypal.me/yourusername or bitcoin:address" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t('notesTerms')}</label>
            <textarea value={data.notes} onChange={(e) => updateField('notes', e.target.value)} className={`${inputClass} resize-none h-24`} placeholder="..." />
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 dark:border-zinc-800 pb-2 text-black dark:text-white">{t('signatureSec')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{t('signatureLabel')}</label>
            <input type="text" value={data.signatureLabel || ''} onChange={(e) => updateField('signatureLabel', e.target.value)} className={inputClass} placeholder={t('defaultSigLabel')} />
          </div>
          <div>
            <label className={labelClass}>{t('signatureImage')}</label>
            {data.signature ? (
               <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900 p-4 border border-gray-200 dark:border-zinc-800">
                 <img src={data.signature} alt="Signature preview" className="h-10 object-contain" />
                 <button 
                   type="button" 
                   onClick={() => updateField('signature', '')}
                   className="text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-500 transition-colors min-h-11 min-w-11 inline-flex items-center justify-center"
                   title="Remove Signature"
                 >
                   <X size={18} />
                 </button>
               </div>
            ) : (
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={signatureInputRef} 
                  onChange={handleSignatureUpload} 
                />
                <button 
                  type="button" 
                  onClick={() => signatureInputRef.current?.click()}
                  className="w-full min-h-11 flex justify-center items-center gap-2 border border-dashed border-gray-300 dark:border-zinc-700 px-4 py-2 text-base sm:text-sm text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-zinc-500 transition-colors bg-white dark:bg-zinc-900 font-medium"
                >
                  <Upload size={16} /> {t('uploadSignature')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
