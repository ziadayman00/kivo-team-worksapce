import {
  Layers,
  MessageSquare,
  ShieldCheck,
  Radio,
  CheckCircle,
  Command,
  Lock,
} from 'lucide-react';

export function BentoGrid() {
  return (
    <section id="bento" className="py-24 md:py-32 bg-[#050507]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
            Engineered Capabilities
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Architecture Meets Craft.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            Every module in KIVO is built as a strictly bounded domain system designed for
            zero-compromise reliability, sub-millisecond response times, and delightful developer
            ergonomics.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Work Management (Col Span 2) */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/40 to-zinc-950 p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/15 transition" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-zinc-900 px-2.5 py-1 text-[11px] font-mono text-zinc-400">
                  <Command className="h-3 w-3" />
                  <span>K to Action</span>
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Cycle-Driven Sprint & Project Velocity
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-lg">
                Hierarchical work management designed for high-performing engineering squads. Break
                initiatives down into cycles, priorities, and predictable delivery statuses with
                zero bloat.
              </p>
            </div>

            {/* Interactive Visual Element */}
            <div className="mt-8 rounded-xl border border-white/[0.06] bg-zinc-950 p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                <span>Cycle 14 — Velocity Burndown</span>
                <span className="text-emerald-400">88% Target Pace</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
                </div>
                <span className="text-[11px] text-zinc-300">42 / 48 Pts</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-zinc-400">
                <div className="rounded border border-zinc-800/80 p-2">18 Completed</div>
                <div className="rounded border border-zinc-800/80 p-2 text-indigo-300">
                  4 In Review
                </div>
                <div className="rounded border border-zinc-800/80 p-2 text-amber-300">
                  2 In Progress
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Contextual Collaboration (Col Span 1) */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/40 to-zinc-950 p-6 sm:p-8 flex flex-col justify-between relative group">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Contextual Threads</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                Discussions anchored directly to work items. Never ask "which ticket is this about?"
                again.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-950 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-mono">
                <span>#discussion: ZIA-25</span>
              </div>
              <div className="rounded bg-zinc-900/80 p-2 text-zinc-300 text-[11px]">
                "Should we enforce email binding on invite acceptance?"
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                <CheckCircle className="h-3 w-3" />
                <span>Resolved: Yes, 403 on mismatch</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Multi-Tenant Isolation (Col Span 1) */}
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/40 to-zinc-950 p-6 sm:p-8 flex flex-col justify-between relative group">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">Provable Tenant Isolation</h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                Every tenant resource carries strict{' '}
                <code className="text-emerald-400">workspace_id</code> scoping. Zero risk of
                cross-organization data leakage.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-zinc-950 p-3.5 font-mono text-[11px] text-zinc-400 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Isolation Harness</span>
                <span className="text-emerald-400">PASS (38/38)</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate">
                WHERE workspace_id = $1 AND status = 'ACTIVE'
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <Lock className="h-3 w-3" />
                <span>Automated DB Gating Active</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Transactional Outbox (Col Span 2) */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/40 to-zinc-950 p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/15 transition" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Radio className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
                  HTTP/2 Multiplexed
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Real-Time Transactional Outbox Engine
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-lg">
                Asynchronous cross-module events are saved atomically in the same database
                transaction using PostgreSQL{' '}
                <code className="text-indigo-400">FOR UPDATE SKIP LOCKED</code>, guaranteeing zero
                dropped events and real-time client push via SSE.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-3">
                <span className="text-[10px] text-zinc-500">POLL METHOD</span>
                <p className="mt-1 font-bold text-zinc-200">SKIP LOCKED</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-3">
                <span className="text-[10px] text-zinc-500">EVENT DISPATCH</span>
                <p className="mt-1 font-bold text-emerald-400">&lt; 3.2ms Latency</p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-zinc-950 p-3">
                <span className="text-[10px] text-zinc-500">DELIVERY PROTOCOL</span>
                <p className="mt-1 font-bold text-indigo-400">Server-Sent Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
