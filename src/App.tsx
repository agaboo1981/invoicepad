/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Eye, X, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { InvoiceData } from './types';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { AdSlot } from './components/AdSlot';
import { CURRENCIES } from './utils';
import { useTranslation } from './i18n';

const getInitialData = (): InvoiceData => {
  const saved = localStorage.getItem('invoicer_data');
  if (saved) {
    try {
      const parsedData = JSON.parse(saved);
      if (!parsedData.locale) parsedData.locale = 'en-US';
      return parsedData;
    } catch (e) {
      console.error("Failed to parse saved invoice data");
    }
  }

  // Auto detect logic based on user's browser language
  const navLang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const baseLang = navLang.split('-')[0].toLowerCase();
  
  let matchedCurr = CURRENCIES.find(c => c.locale === navLang) || 
                    CURRENCIES.find(c => c.locale.toLowerCase().startsWith(baseLang));
                    
  const locale = matchedCurr?.locale || 'en-US';
  const currency = matchedCurr?.code || 'USD';

  return {
    invoiceNumber: 'INV-0001',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    currency,
    locale,
    taxRate: 0,
    discount: 0,
    fromDetails: '',
    toDetails: '',
    items: [],
    notes: '',
    logo: '',
    paymentQrLink: '',
    pdfFileName: 'Invoice_0001',
    isTaxInclusive: false,
    signature: '',
    signatureLabel: '',
  };
};

export default function App() {
  const [data, setData] = useState<InvoiceData>(getInitialData);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load from local storage on mount (done primarily via initializer now)

  const t = useTranslation(data.locale);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('invoicer_data', JSON.stringify(data));
  }, [data]);

  const handlePrint = async () => {
    try {
      const { generateInvoicePDF } = await import('./pdfGenerator');
      generateInvoicePDF(data, t);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to generate PDF. Please check your data and try again.');
    }
  };

  const openShare = (platform: 'whatsapp' | 'twitter' | 'linkedin') => {
    const text = encodeURIComponent('Free invoice maker by InvoicePad. Create invoices fast and download PDF instantly.');
    const encodedUrl = encodeURIComponent(shareUrl);
    const urls = {
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link', error);
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('invoicer_data');
    setData(getInitialData());
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen font-sans bg-[#fafafa] dark:bg-zinc-950 text-black dark:text-zinc-100">
      
      {/* Platform Top Ad Slot - purely for layout context */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-4 no-print flex justify-center">
        <AdSlot label="Top Banner Advertisement" className="w-[728px] h-[90px] hidden md:flex" />
        <AdSlot label="Mobile Ad" className="w-[320px] h-[50px] flex md:hidden" />
      </div>

      <header className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 min-h-16 py-2 sm:py-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-black dark:text-white font-semibold tracking-tight text-base sm:text-lg min-w-0">
            <span className="font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-sm">inv</span>
            <span className="truncate">invoice<span className="text-gray-400 dark:text-zinc-500 hidden sm:inline">pad.shop</span></span>
          </div>
          
          <button 
            onClick={handlePrint}
            className="bg-black dark:bg-white text-white dark:text-black px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-sm font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all border-2 border-black dark:border-white active:scale-95"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('downloadPdf')}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 no-print relative">
        <div className="grid xl:grid-cols-[1fr_minmax(0,1fr)] gap-10 items-start">
          
          {/* Left Column: Form */}
          <div className="xl:sticky xl:top-[6rem] xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto pr-0 xl:pr-4 custom-scrollbar">
            <div className="flex items-start justify-between mb-8 gap-4">
              <p className="text-gray-500 dark:text-zinc-400 max-w-xl text-sm leading-relaxed pr-4">
                {t('appDesc')}
              </p>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                <button 
                  onClick={() => setShowPreviewModal(true)}
                  className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <Eye size={14} /> {t('preview')}
                </button>
                {showResetConfirm ? (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded border border-red-100 dark:border-red-900/30">
                    <span className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Sure?</span>
                    <button onClick={confirmReset} className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold uppercase tracking-wider transition-colors">Yes</button>
                    <span className="text-red-300 dark:text-red-800/50">|</span>
                    <button onClick={() => setShowResetConfirm(false)} className="text-[10px] sm:text-xs text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-bold uppercase tracking-wider transition-colors">No</button>
                  </div>
                ) : (
                  <button 
                    onClick={handleReset}
                    className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <RotateCcw size={14} /> {t('resetAll')}
                  </button>
                )}
              </div>
            </div>
            <InvoiceForm data={data} onChange={setData} />
            
            {/* Inline Rectangle Ad */}
            <div className="mt-12 flex justify-center border-t border-gray-200 dark:border-zinc-800 pt-8 hidden sm:flex">
                <AdSlot label="Box Ad Placeholder" className="w-[300px] h-[250px]" />
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="xl:sticky xl:top-[6rem]">
             <div className="bg-gray-200 dark:bg-zinc-800 p-2 sm:p-4 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-gray-300 dark:border-zinc-700 relative w-full overflow-x-auto">
               <InvoicePreview data={data} />
             </div>
          </div>

        </div>
      </main>

      {/* SEO Content Section (Bottom) */}
      <section className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 mt-16 no-print transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-12 text-black dark:text-white">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('seoTitle')}</h1>
            <p className="text-gray-500 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto">{t('seoDesc')}</p>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 pt-8 border-t border-gray-100 dark:border-zinc-800/50">
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">About InvoicePad</h2>
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                InvoicePad is a free invoice generator and free invoice maker built for freelancers and small businesses that need clean, professional invoices in minutes.
              </p>
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
                Built by independent developer Joshua Adesina, InvoicePad focuses on fast invoice creation, clear totals, and print-ready PDF exports without signup friction.
              </p>
              <ul className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 list-disc pl-5 space-y-1">
                <li>Built by independent developer</li>
                <li>Free and fast invoice generator</li>
                <li>Freelancer invoice tool Nigeria</li>
              </ul>
            </div>
            <aside className="border border-gray-200 dark:border-zinc-800 p-4 sm:p-5 rounded-sm bg-gray-50 dark:bg-zinc-950/50 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Share2 size={14} /> Share InvoicePad</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Help other freelancers discover InvoicePad. Share this tool with your network.
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openShare('whatsapp')} className="px-3 py-2 border border-gray-300 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider hover:bg-white dark:hover:bg-zinc-900 transition-colors">WhatsApp</button>
                <button onClick={() => openShare('twitter')} className="px-3 py-2 border border-gray-300 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider hover:bg-white dark:hover:bg-zinc-900 transition-colors">Twitter/X</button>
                <button onClick={() => openShare('linkedin')} className="px-3 py-2 border border-gray-300 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider hover:bg-white dark:hover:bg-zinc-900 transition-colors">LinkedIn</button>
              </div>
            </aside>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-zinc-800/50">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400 dark:text-zinc-500">Invoice Resources</h2>
            <nav className="flex flex-wrap gap-4 text-sm">
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/guide/compliance">Invoice Compliance Guide</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/guide/getting-paid">Guide to Getting Paid</a>
            </nav>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print py-8 text-center text-xs text-gray-400 dark:text-zinc-500 font-mono transition-colors">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <p className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-zinc-400">InvoicePad • Free invoice maker for freelancers and small businesses</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px]">
            <a className="hover:text-black dark:hover:text-white transition-colors" href="https://joshuaadesina.vercel.app" target="_blank" rel="noreferrer">
              Portfolio <ExternalLink size={12} />
            </a>
          </nav>
          <p>&copy; {new Date().getFullYear()} InvoicePad. All rights reserved.</p>
        </div>
      </footer>

      {/* Hidden print container that takes over during window.print() */}
      <div className="hidden print:block absolute inset-0 z-50 bg-white" id="print-view-wrapper">
         <InvoicePreview data={data} />
      </div>

      {/* Full-Page Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-gray-200 dark:bg-zinc-950 overflow-y-auto flex flex-col no-print">
          <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-gray-300 dark:border-zinc-800 p-3 sm:p-4 flex justify-between items-center gap-3 shadow-sm z-10 transition-colors">
            <span className="font-bold uppercase tracking-widest text-sm text-black dark:text-white flex items-center gap-2">
              <Eye size={16} /> {t('preview')}
            </span>
            <div className="flex items-center gap-3 sm:gap-6">
              <button 
                onClick={handlePrint}
                className="text-black dark:text-white hover:text-gray-600 dark:hover:text-zinc-300 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Download size={16} /> PDF
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <X size={20} /> Close
              </button>
            </div>
          </div>
          <div className="p-3 sm:p-8 flex-1 flex justify-center items-start">
             <div className="border border-gray-300 dark:border-zinc-700 relative shadow-sm max-w-full overflow-x-auto bg-white">
               <InvoicePreview data={data} />
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
