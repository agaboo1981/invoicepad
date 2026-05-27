/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Eye, X, Menu } from 'lucide-react';
import { InvoiceData } from './types';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { AdSlot } from './components/AdSlot';
import { CURRENCIES } from './utils';
import { useTranslation } from './i18n';
import { generateInvoicePDF } from './pdfGenerator';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load from local storage on mount (done primarily via initializer now)

  const t = useTranslation(data.locale);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('invoicer_data', JSON.stringify(data));
  }, [data]);

  const handlePrint = async () => {
    try {
      generateInvoicePDF(data, t);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to generate PDF. Please check your data and try again.');
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    localStorage.removeItem('invoicer_data');
    setData(getInitialData());
    setShowResetConfirm(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans bg-[#fafafa] dark:bg-zinc-950 text-black dark:text-zinc-100">
      
      {/* Platform Top Ad Slot - purely for layout context */}
      <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-4 no-print flex justify-center">
        <AdSlot label="Top Banner Advertisement" className="w-full max-w-[728px] h-[90px] hidden md:flex" />
        <AdSlot label="Mobile Ad" className="w-[320px] h-[50px] flex md:hidden" />
      </div>

      <header className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 sm:py-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-black dark:text-white font-semibold tracking-tight text-base sm:text-lg min-w-0">
            <span className="font-mono bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 text-sm">inv</span>
            <span className="truncate">invoice<span className="text-gray-400 dark:text-zinc-500 hidden sm:inline">pad.shop</span></span>
          </div>
          
          <button 
            onClick={handlePrint}
            className="hidden sm:flex bg-black dark:bg-white text-white dark:text-black px-3 sm:px-5 py-2 min-h-11 text-xs sm:text-sm font-bold uppercase tracking-wider items-center gap-1.5 sm:gap-2 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-all border-2 border-black dark:border-white active:scale-95"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('downloadPdf')}
          </button>

          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden inline-flex items-center justify-center min-h-11 min-w-11 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-zinc-500 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`sm:hidden overflow-hidden border-t border-gray-200 dark:border-zinc-800 transition-all duration-300 ease-out ${mobileMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}>
          <div className="px-4 py-4 space-y-4 bg-white dark:bg-zinc-900">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowPreviewModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-11 px-3 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:text-black dark:hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Eye size={14} /> {t('preview')}
              </button>
              {showResetConfirm ? (
                <div className="w-full min-h-11 px-3 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3 text-red-600 dark:text-red-400">
                  <span>Sure?</span>
                  <div className="flex items-center gap-3">
                    <button onClick={confirmReset} className="hover:text-red-800 dark:hover:text-red-300 transition-colors">Yes</button>
                    <button onClick={() => setShowResetConfirm(false)} className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">No</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleReset}
                  className="w-full min-h-11 px-3 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:text-black dark:hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw size={14} /> {t('resetAll')}
                </button>
              )}
              <button
                onClick={() => {
                  handlePrint();
                  setMobileMenuOpen(false);
                }}
                className="w-full min-h-11 px-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <Download size={14} /> {t('downloadPdf')}
              </button>
            </div>

            <nav className="pt-1 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/freelancer-invoice-generator.html">Freelancer</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/consultant-invoice-template.html">Consultant</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/invoice-template-guide.html">Guide</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 pb-24 sm:pb-8 no-print relative">
        <div className="grid xl:grid-cols-[1fr_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Form */}
          <div className="xl:sticky xl:top-[6rem] xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto pr-0 xl:pr-4 custom-scrollbar">
            <div className="flex items-start justify-between mb-6 sm:mb-8 gap-4">
              <p className="text-gray-500 dark:text-zinc-400 max-w-xl text-sm leading-relaxed pr-0 sm:pr-4">
                {t('appDesc')}
              </p>
              <div className="hidden sm:flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-10 sm:space-y-12 text-black dark:text-white">
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{t('seoTitle')}</h1>
            <p className="text-gray-500 dark:text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto">{t('seoDesc')}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-gray-100 dark:border-zinc-800/50">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400 dark:text-zinc-500">{t('seoF1Title')}</h2>
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm">{t('seoF1Desc')}</p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400 dark:text-zinc-500">{t('seoF2Title')}</h2>
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm">{t('seoF2Desc')}</p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400 dark:text-zinc-500">{t('seoF3Title')}</h2>
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm">{t('seoF3Desc')}</p>
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400 dark:text-zinc-500">{t('seoF4Title')}</h2>
              <p className="text-gray-600 dark:text-zinc-300 leading-relaxed text-sm">{t('seoF4Desc')}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-zinc-800/50">
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-3 text-gray-400 dark:text-zinc-500">Invoice Resources</h2>
            <nav className="flex flex-wrap gap-4 text-sm">
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/freelancer-invoice-generator.html">Invoice Generator for Freelancers</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/consultant-invoice-template.html">Consultant Invoice Template</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/invoice-generator-india.html">Invoice Generator India</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/invoice-generator-usa.html">Invoice Generator USA</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/invoice-generator-uk.html">Invoice Generator UK</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/invoice-generator-canada.html">Invoice Generator Canada</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/self-employed-invoice-template.html">Self-Employed Invoice Template</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/hourly-invoice-template.html">Hourly Invoice Template</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/contractor-invoice-generator.html">Contractor Invoice Generator</a>
              <a className="text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors" href="/invoice-template-guide.html">Invoice Template Guide</a>
            </nav>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 no-print py-8 text-center text-xs text-gray-400 dark:text-zinc-500 font-mono transition-colors">
        <div className="px-4 sm:px-6 space-y-4">
          <p>&copy; {new Date().getFullYear()} InvoicePad. All rights reserved.</p>
          <nav className="flex flex-wrap justify-center gap-4 text-[11px]">
            <a className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" href="/about.html">About</a>
            <a className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" href="/contact.html">Contact</a>
            <a className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" href="/privacy-policy.html">Privacy</a>
            <a className="hover:text-gray-600 dark:hover:text-zinc-300 transition-colors" href="/terms-of-service.html">Terms</a>
          </nav>
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

      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden no-print">
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 bg-white/95 dark:bg-zinc-900/95 border-t border-gray-200 dark:border-zinc-800 backdrop-blur supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-zinc-900/80">
          <button
            onClick={handlePrint}
            className="w-full min-h-11 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('downloadPdf')}
          </button>
        </div>
      </div>

    </div>
  );
}
