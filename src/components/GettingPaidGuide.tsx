import React from 'react';

export function GettingPaidGuide() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 prose dark:prose-invert">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">The Freelancer's Guide to Getting Paid Faster</h1>
      
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Mastering the Payment Lifecycle</h2>
        <p className="leading-relaxed text-gray-600 dark:text-zinc-300">
          Sending the invoice is only half the battle. Getting paid on time requires setting clear expectations, automating your reminders, and making it dead-simple for clients to send you money.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">5 Strategies to Accelerate Payments</h2>
        <ul className="list-decimal pl-5 space-y-3 leading-relaxed text-gray-600 dark:text-zinc-300">
          <li><strong>Set Shorter Terms:</strong> Move from Net-30 to Net-14 or even "Due Upon Receipt" for smaller projects.</li>
          <li><strong>Automate Your Reminders:</strong> Send a friendly follow-up 3 days before the due date, and one on the day of.</li>
          <li><strong>Offer Multiple Payment Channels:</strong> Whether it's bank transfers, PayPal, or crypto—remove friction.</li>
          <li><strong>Require Upfront Deposits:</strong> For new clients, always request 25-50% before work starts.</li>
          <li><strong>Professionalism wins:</strong> A clean, professional PDF invoice commands more respect than a messy email.</li>
        </ul>
      </section>

      <section className="bg-gray-50 dark:bg-zinc-900 p-8 border border-gray-100 dark:border-zinc-800 rounded-lg mt-12">
        <h3 className="text-xl font-bold mb-3">Ready to send your next invoice?</h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
          Use our generator to create professional invoices that clearly state your payment terms and include instant payment links.
        </p>
        <a href="/" className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
          Generate Professional Invoice
        </a>
      </section>
    </article>
  );
}
