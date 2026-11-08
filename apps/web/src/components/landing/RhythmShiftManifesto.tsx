import { ShieldCheck, CheckCircle } from 'lucide-react';

export function RhythmShiftManifesto() {
  return (
    <section className="relative w-full py-28 md:py-36 bg-[#e6ede6] text-[#0f1f14] overflow-hidden selection:bg-emerald-800 selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Top Headline */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/20 bg-emerald-900/10 px-3.5 py-1 text-xs font-mono font-semibold tracking-wide text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-800" />
            <span>ARCHITECTURAL MANIFESTO • ADR-001</span>
          </div>

          <h2 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0a150e] leading-[1.08]">
            The way teams build software is fractured.
            <span className="block text-emerald-800 mt-2">
              The remedy is a provably isolated modular monolith.
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-emerald-950/80 leading-relaxed max-w-3xl">
            Engineering organizations have suffered a decade of microservice sprawl — paying
            exorbitant taxes in network latency, complex Sagas, fractured telemetry, and broken auth
            boundaries. KIVO rejects premature distributed complexity in favor of mathematically
            enforced domain boundaries inside a unified, high-speed runtime.
          </p>
        </div>

        {/* High-Contrast Comparative Architectural Blueprint */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Microservices Chaos Column */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-900/15 bg-white/70 p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-900/10 pb-3">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-red-700">
                  Fragile Microservice Sprawl
                </span>
                <span className="font-mono text-xs text-zinc-500">14 Isolated Services</span>
              </div>

              <div className="mt-6 space-y-3 font-mono text-xs text-zinc-700">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-900 flex items-center justify-between">
                  <span>Cross-Service Latency</span>
                  <span className="font-bold">~140ms P95 overhead</span>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-900 flex items-center justify-between">
                  <span>Data Consistency</span>
                  <span className="font-bold">Fragile 2PC / Sagas</span>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-900 flex items-center justify-between">
                  <span>Tenant Isolation</span>
                  <span className="font-bold">Fragmented Token Verification</span>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-900 flex items-center justify-between">
                  <span>Infrastructure Footprint</span>
                  <span className="font-bold">Kubernetes + 4 Brokers</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-900/10 text-xs text-zinc-600 italic">
              Result: Disconnected tools, missing context, and endless synchronization war rooms.
            </div>
          </div>

          {/* KIVO Modular Monolith Column */}
          <div className="lg:col-span-7 rounded-2xl border-2 border-emerald-900/30 bg-[#0d1f14] text-zinc-100 p-7 sm:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold text-emerald-400">
                    KIVO Strictly Bounded Monolith
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    ADR-001 & ADR-013
                  </span>
                </div>
                <span className="font-mono text-xs text-emerald-400/80">
                  Single Process • Zero Network Hops
                </span>
              </div>

              {/* Module Boundary Diagram */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Identity',
                  'Workspace',
                  'AuthZ',
                  'Work Mgmt',
                  'Collaboration',
                  'Activity',
                  'Notification',
                  'Search',
                ].map((mod) => (
                  <div
                    key={mod}
                    className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/60 font-mono text-center"
                  >
                    <span className="block text-xs font-bold text-emerald-300">{mod}</span>
                    <span className="block text-[10px] text-zinc-400 mt-0.5">Encapsulated</span>
                  </div>
                ))}
              </div>

              {/* Verified Metrics */}
              <div className="mt-6 space-y-2 font-mono text-xs">
                <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-zinc-300">Internal IPC Latency</span>
                  <span className="text-emerald-400 font-bold">&lt; 0.2ms (Direct in-memory)</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-zinc-300">Transaction Guarantee</span>
                  <span className="text-emerald-400 font-bold">PostgreSQL Native ACID Outbox</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-zinc-300">Architectural Boundary Enforcement</span>
                  <span className="text-emerald-400 font-bold">100% dependency-cruiser Gate</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/40 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Verified across 38 native PostgreSQL tests
              </span>
              <span className="text-zinc-400">Node.js 24 LTS Native</span>
            </div>
          </div>
        </div>

        {/* 4 Architectural Rules Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              code: 'RULE-01',
              title: 'No Cross-Module Internals',
              desc: 'Modules interact exclusively via declared public interfaces.',
            },
            {
              code: 'RULE-02',
              title: 'No Cross-Persistence Access',
              desc: 'Modules never import or write to another module’s tables.',
            },
            {
              code: 'RULE-03',
              title: 'Zero Frontend Leakage',
              desc: 'Apps/web strictly communicates via @kivo/api-client.',
            },
            {
              code: 'RULE-04',
              title: 'Zero Circular Dependencies',
              desc: 'Strict DAG hierarchy enforced on every git commit hook.',
            },
          ].map((rule) => (
            <div
              key={rule.code}
              className="rounded-xl border border-zinc-900/10 bg-white/50 p-4 font-mono text-xs"
            >
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span>{rule.code}</span>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              <div className="font-bold text-zinc-900 mt-2 text-sm">{rule.title}</div>
              <p className="text-zinc-600 mt-1 text-[11px] leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
