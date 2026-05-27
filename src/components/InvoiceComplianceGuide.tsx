import React from 'react';

export function InvoiceComplianceGuide() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">The Freelancer's Ultimate Guide to Invoice Compliance</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Why Professional Invoicing Matters</h2>
        <p className="leading-relaxed text-gray-600 dark:text-zinc-300">
          An invoice is more than a request for payment—it is a legal document. Proper invoicing is the single most important step you can take to get paid faster, avoid tax audits, and maintain a professional reputation with your clients.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">The 7 Essential Elements of a Compliant Invoice</h2>
        <ul className="list-decimal pl-5 space-y-3 leading-relaxed text-gray-600 dark:text-zinc-300">
          <li><strong>Unique Invoice Number:</strong> Essential for your accounting records.</li>
          <li><strong>Accurate Issue & Due Dates:</strong> Clearly stated deadlines prevent payment delays.</li>
          <li><strong>Your Business Details:</strong> Including tax ID/VAT number if applicable.</li>
          <li><strong>Client Details:</strong> Full name and registered business address.</li>
          <li><strong>Clear Description of Services:</strong> Avoid generic terms like "work done." Be specific.</li>
          <li><strong>Total Amount Due:</strong> Clearly highlighted.</li>
          <li><strong>Payment Terms & Methods:</strong> Provide explicit bank details or direct payment links (like QR codes).</li>
        </ul>
      </section>

      <section className="bg-gray-50 dark:bg-zinc-900 p-8 border border-gray-100 dark:border-zinc-800 rounded-lg mt-12">
        <h3 className="text-xl font-bold mb-3">Need to create an invoice right now?</h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
          Our free, professional-grade invoice generator helps you stay compliant automatically.
        </p>
        <a href="/" className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
          Create an Invoice Free
        </a>
      </section>
    </article>
  );
}
