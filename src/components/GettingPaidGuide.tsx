import React from 'react';

export function GettingPaidGuide() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <article className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Authority Resource</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">The Freelancer's Guide to Getting Paid Faster</h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto italic">
            Stop chasing payments and start accelerating your cash flow with these proven strategies.
          </p>
        </header>

        <div className="space-y-12 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">Mastering the Payment Lifecycle</h2>
            <p>
              Sending the invoice is only half the battle. Getting paid on time requires setting clear expectations, automating your follow-ups, and making it dead-simple for clients to send you money. 
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">5 Strategies to Accelerate Payments</h2>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-xl shadow-sm">
              <ul className="space-y-6">
                {[
                  { title: "Set Shorter Terms", desc: "Move from Net-30 to Net-14 or even 'Due Upon Receipt' for smaller projects." },
                  { title: "Automate Reminders", desc: "Send a professional follow-up 3 days before the due date, and another on the day of." },
                  { title: "Remove Payment Friction", desc: "Offer multiple channels (bank transfer, PayPal, QR codes) to simplify the process." },
                  { title: "Require Deposits", desc: "For new clients, always request a 25–50% upfront deposit before starting work." },
                  { title: "Professionalism Wins", desc: "A clean, consistent PDF invoice commands more respect than a quick, informal email." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 font-mono">0{i + 1}</span>
                    <div>
                      <h4 className="font-bold text-black dark:text-white text-xl">{item.title}</h4>
                      <p className="text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <section className="mt-20 bg-black dark:bg-white text-white dark:text-black p-10 rounded-2xl flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold mb-3">Send Invoices That Get Paid</h3>
          <p className="opacity-80 mb-8 max-w-md">Our generator creates professional, clear invoices designed to speed up your payments.</p>
          <a href="/" className="bg-white dark:bg-black text-black dark:text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
            Generate Free Invoice
          </a>
        </section>
      </article>
    </div>
  );
}
