import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Zap, Terminal } from 'lucide-react';
import { BrandHeroCockpit } from './BrandHeroCockpit';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 bg-[#050507]">
      {/* Background ambient lighting (Neon green/emerald + Indigo glow) */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[750px] w-[1100px] rounded-full bg-gradient-to-b from-emerald-500/15 via-indigo-600/10 to-transparent blur-[160px] opacity-70" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Architectural Specification Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-xs text-zinc-400 tracking-wider">
              SYSTEM ARCHITECTURE SPECIFICATION &bull; SD-13 / ADR-001
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
            <span>MODULAR MONOLITH</span>
            <span>&bull;</span>
            <span className="text-emerald-400">POSTGRESQL 17 EXCLUSIVE</span>
          </div>
        </div>

        {/* Hero Title & Manifesto */}
        <div className="mt-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-bold text-emerald-400 mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>STOP JUGGLING JIRA, SLACK, AND CUSTOM RLS HACKS</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.95]">
            THE TEAM
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300">
              OPERATING SYSTEM.
            </span>
          </h1>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8">
              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-sans">
                Planning sprints in Jira, debating decisions in lost Slack threads, and hacking
                multi-tenant security in custom middleware is draining 30% of engineering velocity.
                KIVO converges cycles, code-anchored discussions, and mathematically sealed
                PostgreSQL 17 isolation into a singular, sub-millisecond cockpit.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-emerald-400 px-7 py-3.5 text-xs font-mono font-bold text-black shadow-xl shadow-emerald-400/20 transition hover:bg-emerald-300 hover:scale-[1.02]"
                >
                  <span>INITIALIZE WORKSPACE FREE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <a
                  href="#comparison"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-zinc-900/60 px-6 py-3.5 text-xs font-mono font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                  <span>COMPARE VS JIRA + SLACK</span>
                </a>
              </div>
            </div>

            {/* Quick System Telemetry Box (Right Column) */}
            <div className="md:col-span-4 rounded-xl border border-white/[0.08] bg-black/60 p-4 font-mono text-xs space-y-2.5">
              <div className="text-[10px] text-zinc-500 flex items-center justify-between border-b border-zinc-900 pb-2">
                <span>RUNTIME BENCHMARKS</span>
                <span className="text-emerald-400">NODE 24 LTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cross-Tenant Leak:</span>
                <span className="font-bold text-emerald-400">0.00% Guaranteed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Outbox Event Latency:</span>
                <span className="font-bold text-zinc-200">&lt; 3.2ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Session Security:</span>
                <span className="font-bold text-indigo-300">Opaque (Zero LocalStorage)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grand Centerpiece: The Live Interactive Workspace Cockpit */}
        <BrandHeroCockpit />

        {/* Cockpit Trust Signals Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-500 px-2 gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive Production Preview • Zero Fake Mockups</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Provable Tenant Isolation (ADR-003)</span>
            <span>•</span>
            <span>Argon2id Credentials</span>
            <span>•</span>
            <span>SKIP LOCKED Outbox</span>
          </div>
        </div>
      </div>
    </section>
  );
}
