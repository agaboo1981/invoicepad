import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { InvoiceData } from '../types';
import { calculateTotals, formatCurrency } from '../utils';
import { useTranslation } from '../i18n';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const t = useTranslation(data.locale);
  const { subtotal, discountAmount, taxAmount, total } = calculateTotals(data);

  return (
    <div 
      id="invoice-preview" 
      className="bg-white border text-sm border-gray-200 aspect-[1/1.414] w-full min-w-[320px] sm:min-w-[640px] max-w-[800px] mx-auto flex flex-col font-sans mb-8 print:border-none uppercase-labels"
    >
      <div className="p-4 sm:p-8 lg:p-12 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mb-1">{t('invoice')}</h1>
            <p className="font-mono text-gray-500 text-xs mt-1">#{data.invoiceNumber || '---'}</p>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
            {data.companyName && (
              <span className="font-bold text-lg sm:text-xl tracking-tight text-gray-800 break-words">{data.companyName}</span>
            )}
            {data.logo && (
              <img src={data.logo} alt="Company Logo" className="max-h-14 sm:max-h-16 max-w-[160px] sm:max-w-[200px] object-contain" />
            )}
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">{t('from')}</h3>
            <pre className="font-sans whitespace-pre-wrap text-black leading-relaxed font-medium">
              {data.fromDetails || '---'}
            </pre>
          </div>
          <div className="text-left sm:text-right">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">{t('billedTo')}</h3>
            <pre className="font-sans whitespace-pre-wrap text-black leading-relaxed font-medium">
              {data.toDetails || '---'}
            </pre>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-12 py-4 border-y border-gray-100">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{t('issueDate')}</h3>
            <p className="font-mono text-black">{data.issueDate || '---'}</p>
          </div>
          <div className="text-left sm:text-right">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{t('dueDate')}</h3>
            <p className="font-mono text-black">{data.dueDate || '---'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-3 px-1 text-[10px] uppercase font-bold tracking-wider text-gray-400 w-full">{t('itemDesc')}</th>
                <th className="py-3 px-1 text-[10px] uppercase font-bold tracking-wider text-gray-400 whitespace-nowrap text-right">{t('qty')}</th>
                <th className="py-3 px-1 text-[10px] uppercase font-bold tracking-wider text-gray-400 whitespace-nowrap text-right">{t('price')}</th>
                <th className="py-3 px-1 text-[10px] uppercase font-bold tracking-wider text-gray-400 whitespace-nowrap text-right">{t('total')}</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-300 text-xs italic">{t('noItems')}</td>
                </tr>
              )}
              {data.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 px-1 font-sans font-medium text-black">{item.description}</td>
                  <td className="py-4 px-1 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-4 px-1 text-right text-gray-600">{formatCurrency(item.price, data.currency, data.locale)}</td>
                  <td className="py-4 px-1 text-right font-medium text-black">
                    {formatCurrency(item.quantity * item.price, data.currency, data.locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-8 mb-12">
          <div className="w-full max-w-[280px]">
            <div className="flex justify-between py-2 text-sm font-mono text-gray-500">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(subtotal, data.currency, data.locale)}</span>
            </div>
            {data.discount > 0 && (
              <div className="flex justify-between py-2 text-sm font-mono text-gray-500">
                <span>{t('discount')} ({data.discount}%)</span>
                <span>-{formatCurrency(discountAmount, data.currency, data.locale)}</span>
              </div>
            )}
            {data.taxRate > 0 && (
              <div className="flex justify-between py-2 text-sm font-mono text-gray-500">
                <span>{data.isTaxInclusive ? t('includesTax') : t('tax')} ({data.taxRate}%)</span>
                <span>{formatCurrency(taxAmount, data.currency, data.locale)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 mt-2 border-t-2 border-black font-bold text-lg font-mono text-black">
              <span className="font-sans uppercase tracking-tight text-sm self-center">{t('total')}</span>
              <span>{formatCurrency(total, data.currency, data.locale)}</span>
            </div>
          </div>
        </div>

        {/* Final Section: Notes, Signature & QR Code */}
        <div className="mt-auto border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8">
          <div className="flex-1 space-y-6">
            {data.notes && (
              <div>
                <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">{t('notesTerms')}</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-2xl whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}
            
            {(data.signature || data.signatureLabel) && (
              <div className="pt-4">
                {data.signature ? (
                  <img src={data.signature} alt="Signature" className="h-16 object-contain mb-2" />
                ) : (
                  <div className="h-16 w-48 border-b border-gray-300 mb-2"></div>
                )}
                <p className="text-[10px] font-bold text-black uppercase tracking-wider">{data.signatureLabel || t('defaultSigLabel')}</p>
              </div>
            )}
          </div>
          {data.paymentQrLink && (
            <div className="flex flex-col items-start sm:items-end shrink-0">
              <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">{t('scanToPay')}</h3>
              <div className="p-2 border border-gray-200 bg-white shadow-sm">
                <QRCodeSVG value={data.paymentQrLink} size={72} level="M" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
