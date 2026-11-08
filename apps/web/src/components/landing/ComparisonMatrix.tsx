import { CheckCircle2, XCircle, ArrowRight, Zap, Shield, Layers, DollarSign } from 'lucide-react';

export function ComparisonMatrix() {
  const comparisonRows = [
    {
      capability: 'Cycle Planning & Sprint Velocity',
      traditional: 'Jira / Linear (Isolated silo, manual sync)',
      traditionalBad: true,
      kivo: 'Native Cycle Engine + Commit Burndown Math',
      kivoGood: true,
    },
    {
      capability: 'Technical Discussions & RFCs',
      traditional: 'Ephemeral Slack / Discord (Lost in DM noise)',
      traditionalBad: true,
      kivo: 'Ticket-Anchored Context Streams with SSE',
      kivoGood: true,
    },
    {
      capability: 'Multi-Tenant Security & Isolation',
      traditional: 'Fragile manual WHERE clauses or 3rd-party auth proxies',
      traditionalBad: true,
      kivo: 'PostgreSQL 17 Provable Boundary & SHA-256 Tokens',
      kivoGood: true,
    },
    {
      capability: 'Runtime Event Consistency',
      traditional: 'Kafka / RabbitMQ microservice sprawl & network lag',
      traditionalBad: true,
      kivo: 'In-Memory Modular Monolith + SKIP LOCKED Outbox',
      kivoGood: true,
    },
    {
      capability: 'Session Credential Security',
      traditional: 'JWT stored in vulnerable browser localStorage',
      traditionalBad: true,
      kivo: 'Opaque HTTP-only Cookies + Argon2id Hashing',
      kivoGood: true,
    },
    {
      capability: 'Total Cost per Engineer / Month',
      traditional: '$92 / seat (Jira $16 + Slack $15 + Notion $12 + Linear $14 + Auth0 $35)',
      traditionalBad: true,
      kivo: '$10 / seat (All 8 Modules Included, Unlimited Workspaces)',
      kivoGood: true,
    },
  ];

  return (
    <section className="py-28 bg-[#040407] border-t border-white/[0.08] relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-400 mb-4">
            <DollarSign className="h-3.5 w-3.5" />
            <span>THE REAL ENGINEERING TAX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Stop Paying the Fragmentation Tax.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            Compare the friction of 5 disconnected tools against one high-density, unified
            engineering operating system.
          </p>
        </div>

        {/* Head-to-head Comparison Table */}
        <div className="mt-16 rounded-2xl border border-white/[0.1] bg-[#09090e] shadow-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 border-b border-white/[0.08] bg-zinc-950/80 p-5 font-mono text-xs font-bold text-zinc-400">
            <div className="col-span-12 sm:col-span-4 uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-400" />
              <span>Core Architectural Capability</span>
            </div>
            <div className="hidden sm:block sm:col-span-4 uppercase tracking-wider text-red-400 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span>Fragmented SaaS Stack</span>
            </div>
            <div className="col-span-12 sm:col-span-4 uppercase tracking-wider text-emerald-400 flex items-center gap-2 mt-2 sm:mt-0">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>KIVO Unified OS</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.06]">
            {comparisonRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 p-5 text-xs font-mono items-center hover:bg-white/[0.02] transition"
              >
                <div className="col-span-12 sm:col-span-4 font-bold text-white mb-2 sm:mb-0">
                  {row.capability}
                </div>
                <div className="col-span-12 sm:col-span-4 text-zinc-400 flex items-center gap-2 mb-2 sm:mb-0">
                  <span className="text-red-400 sm:hidden font-bold">Old: </span>
                  <span className="text-zinc-400">{row.traditional}</span>
                </div>
                <div className="col-span-12 sm:col-span-4 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>{row.kivo}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table Bottom ROI Callout */}
          <div className="border-t border-emerald-500/30 bg-emerald-950/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-white font-bold text-sm">
                  Save $82/user per month + 5.2 engineering hours/week
                </span>
                <span className="block text-emerald-400 text-[11px] mt-0.5">
                  Eliminates context switching and multi-service credential leaks permanently.
                </span>
              </div>
            </div>

            <a
              href="#pricing"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs flex items-center gap-1.5 transition whitespace-nowrap shadow-lg shadow-emerald-500/20"
            >
              <span>View Pricing Plans</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
