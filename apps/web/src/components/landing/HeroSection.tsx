import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Terminal,
  Sparkles,
  Layers,
  MessageSquare,
  Radio,
  CheckCircle2,
  Clock,
  ChevronRight,
  Database,
} from 'lucide-react';

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'board' | 'thread'>('board');

  return (
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 bg-grid-mesh">
      {/* Background radial gradient glow (Neon & Vercel style) */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-emerald-500/10 blur-[130px] opacity-70" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Badge */}
        <div className="flex justify-center">
          <a
            href="#architecture"
            className="group inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md transition hover:border-indigo-500/60 hover:bg-indigo-500/20"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>KIVO 1.0 Modular Monolith Released</span>
            <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Grand Headline */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-white">The Team Operating System</span>
            <span className="mt-2 block bg-gradient-to-r from-indigo-300 via-indigo-100 to-emerald-300 bg-clip-text text-transparent">
              Engineered for Velocity.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate the fragmented tangle of disjointed issue trackers, chat silos, and permission
            sprawl. KIVO unifies work planning, contextual collaboration, and multi-tenant
            governance into a cohesive, high-craft platform.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-md transition hover:bg-white/[0.07] hover:text-white"
            >
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Interactive Sandbox</span>
            </a>
          </div>

          {/* Key Engineering Pillars Checklist */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Zero Cross-Tenant Leaks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Modular Monolith (ADR-001)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Real-Time SSE Outbox</span>
            </div>
          </div>
        </div>

        {/* 3D Glassmorphic Floating Product Window Mockup */}
        <div className="mt-16 sm:mt-20 relative mx-auto max-w-5xl">
          {/* Ambient rim glow behind the window */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-emerald-500/20 to-purple-500/20 blur-xl opacity-60" />

          <div className="relative rounded-2xl border border-white/[0.12] bg-[#0c0d12]/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090a0f] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-emerald-400" />
                  kivo.app / workspaces / engineering-core
                </span>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('board')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    activeTab === 'board'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>Cycle 14 Board</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('thread')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    activeTab === 'thread'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Contextual Thread</span>
                </button>
              </div>

              {/* Live Status indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>SSE Outbox: Live</span>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-4 sm:p-6 min-h-[380px]">
              {activeTab === 'board' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1: In Progress */}
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                        <Clock className="h-3.5 w-3.5 text-amber-400" />
                        In Progress
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        2
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/[0.05] p-3 text-xs shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-indigo-400">ZIA-25</span>
                          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">
                            High
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-white">
                          Implement Workspace invitation acceptance and Membership lifecycle
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1 text-emerald-400 font-mono">
                            <CheckCircle2 className="h-3 w-3" /> 100% Tests Pass
                          </span>
                          <span className="font-mono">@ziad</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-zinc-400">ZIA-26</span>
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 uppercase">
                            Medium
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-zinc-200">
                          Workspace bootstrap, membership context and tenant switching
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Review */}
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                        <Radio className="h-3.5 w-3.5 text-indigo-400" />
                        In Review
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        1
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-zinc-400">ZIA-24</span>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 uppercase">
                            Verified
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-zinc-200">
                          Argon2id auth and opaque session lifecycle integration
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Done */}
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-3.5">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Completed
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                        3
                      </span>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-xs opacity-75">
                        <span className="font-mono text-[10px] text-zinc-500">ZIA-22</span>
                        <p className="mt-1 line-through text-zinc-400">
                          PostgreSQL 17 physical schemas and migrations
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-3 text-xs opacity-75">
                        <span className="font-mono text-[10px] text-zinc-500">ZIA-20</span>
                        <p className="mt-1 line-through text-zinc-400">
                          Architecture boundary rejection test harness
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Thread View */
                <div className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-5 space-y-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-white">
                        Discussion on ZIA-25 (Invitation Acceptance & Sole Owner Invariant)
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">Anchored Context</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
                        ZA
                      </div>
                      <div className="flex-1 rounded-lg border border-white/[0.06] bg-zinc-900/60 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-200">Ziad Ayman</span>
                          <span className="text-[10px] text-zinc-500">10m ago</span>
                        </div>
                        <p className="mt-1 text-zinc-300">
                          Single-use SHA-256 invitation tokens are verified and bound directly to
                          recipient email. Non-matching accounts receive 403 Forbidden.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pl-6">
                      <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[10px]">
                        AI
                      </div>
                      <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-400">
                            Antigravity Execution Agent
                          </span>
                          <span className="text-[10px] text-zinc-500">Just now</span>
                        </div>
                        <p className="mt-1 text-zinc-300">
                          Rule BR-001/BR-003 enforced: Sole-owner cannot be suspended or demoted. 38
                          PostgreSQL integration tests and 5 Playwright journeys verified.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
