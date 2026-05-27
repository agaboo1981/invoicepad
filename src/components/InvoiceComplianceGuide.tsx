import React from 'react';

export function InvoiceComplianceGuide() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <article className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Authority Resource</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">The Freelancer's Ultimate Guide to Invoice Compliance</h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto italic">
            Transform your invoicing from a simple request into a professional legal asset.
          </p>
        </header>
        
        <div className="space-y-12 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">Why Professional Invoicing Matters</h2>
            <p>
              An invoice is more than a simple request for payment; it is a critical legal document. Proper invoicing is the single most important step you can take to get paid faster, avoid tax audits, and maintain a professional reputation with your clients.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">The 7 Essential Elements of a Compliant Invoice</h2>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl shadow-sm">
              <ul className="space-y-5">
                {[
                  "Unique Invoice Number",
                  "Accurate Issue & Due Dates",
                  "Your Business Details (Tax/VAT)",
                  "Full Client Details",
                  "Granular Service Descriptions",
                  "Total Amount Due",
                  "Explicit Payment Terms & Details"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="font-semibold text-black dark:text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <section className="mt-20 bg-black dark:bg-white text-white dark:text-black p-10 rounded-2xl flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold mb-3">Professional Invoices Start Here</h3>
          <p className="opacity-80 mb-8 max-w-md">Our generator handles these compliance standards automatically.</p>
          <a href="/" className="bg-white dark:bg-black text-black dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
            Generate Free Invoice
          </a>
        </section>
      </article>
    </div>
  );
}
