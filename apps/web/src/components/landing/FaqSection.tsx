import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'How does KIVO guarantee tenant isolation in a shared database?',
      answer:
        'KIVO uses a shared-table schema with an immutable `workspace_id` discriminator column (ADR-003). Every SQL query is automatically scoped by workspace ID and verified by automated integration test suites running against native PostgreSQL 17. Cross-tenant leakage is strictly prevented at the data access layer.',
    },
    {
      question: 'Why a Modular Monolith instead of microservices?',
      answer:
        'Microservices introduce severe distributed systems tax: network serialization latency, two-phase commits, and deployment fragility. KIVO partitions domain logic into 8 strictly bounded NestJS modules with static boundary enforcement (dependency-cruiser), giving you the clean encapsulation of services with the transactional safety and simplicity of a monolith (ADR-001).',
    },
    {
      question: 'How are real-time events delivered if not using WebSockets?',
      answer:
        'KIVO relies on Server-Sent Events (SSE) combined with the PostgreSQL Transactional Outbox pattern (`FOR UPDATE SKIP LOCKED`). SSE operates natively over standard HTTP/2 multiplexing, automatically reconnects, is firewall/proxy friendly, and avoids the stateful connection overhead of raw WebSockets.',
    },
    {
      question: 'Where are session tokens stored in the browser?',
      answer:
        'Zero authentication or session tokens are stored in `localStorage` or `sessionStorage` (ADR-010). KIVO uses HTTP-only, Secure, SameSite opaque session cookies with SHA-256 database hashes. This renders the application entirely immune to cross-site scripting (XSS) token extraction.',
    },
    {
      question: 'Can KIVO be self-hosted on our own infrastructure?',
      answer:
        'Yes. KIVO is open-core and runs on standard Node.js 24 LTS and native PostgreSQL 17. You can clone the monorepo, configure `.env` with your PostgreSQL connection string, and run migrations via Drizzle ORM in seconds.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-24 bg-[#050507] border-t border-white/[0.06]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            TECHNICAL ARCHITECTURE & SPECIFICATIONS
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Technical Architecture FAQs
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.06] bg-zinc-900/40 transition hover:border-white/[0.12]"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white focus:outline-none"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
