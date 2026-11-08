import { Link } from 'react-router-dom';
import { ArrowRight, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050507] text-zinc-400 text-xs relative overflow-hidden">
      {/* Pre-footer Call to Action Banner */}
      <div className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-[#050507]">
        <div className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-72 w-[700px] rounded-full bg-emerald-500/10 blur-[130px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 mb-6">
            <Terminal className="h-3.5 w-3.5" />
            <span>OPEN FOR HIGH-VELOCITY ENGINEERING TEAMS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
            Build on Provable Foundations.
            <span className="block text-emerald-400 mt-2">
              Deploy with Mathematical Confidence.
            </span>
          </h2>

          <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate cognitive fragmentation between issue trackers, chat rooms, and auth gates.
            Experience the singular power of an operating system built on PostgreSQL 17
            multi-tenancy.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-xs font-bold text-black shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-400 hover:scale-[1.02]"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="https://github.com/ziadayman00/kivo-team-worksapce"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-zinc-900/80 px-7 py-3.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Explore GitHub Repository</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 font-bold text-black text-xs">
                K
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-mono">
                KIVO // OS
              </span>
            </div>
            <p className="mt-3 text-xs text-zinc-500 max-w-xs leading-relaxed">
              The high-craft team operating system connecting sprint velocity, contextual
              discussions, and multi-tenant governance into a unified modular monolith.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All 8 Modules Fully Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-zinc-400 font-mono text-xs">
              <li>
                <a href="#cycles" className="hover:text-white transition">
                  01 / Cycles
                </a>
              </li>
              <li>
                <a href="#threads" className="hover:text-white transition">
                  02 / Threads
                </a>
              </li>
              <li>
                <a href="#isolation" className="hover:text-white transition">
                  03 / Multi-Tenancy
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Architecture
            </h4>
            <ul className="mt-3 space-y-2 text-zinc-400 font-mono text-xs">
              <li>
                <a href="#code-studio" className="hover:text-white transition">
                  Code Studio
                </a>
              </li>
              <li>
                <span className="text-zinc-500">ADR-001 (Monolith)</span>
              </li>
              <li>
                <span className="text-zinc-500">ADR-003 (Tenancy)</span>
              </li>
              <li>
                <span className="text-zinc-500">PostgreSQL 17 Native</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Domain Modules
            </h4>
            <ul className="mt-3 space-y-2 text-zinc-400 font-mono text-xs">
              <li>
                <span className="text-zinc-500">IdentityModule</span>
              </li>
              <li>
                <span className="text-zinc-500">WorkspaceModule</span>
              </li>
              <li>
                <span className="text-zinc-500">WorkManagement</span>
              </li>
              <li>
                <span className="text-zinc-500">Notification (SSE)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Spatial Wireframe Relief Horizon (Neon-Inspired 3D Perspective Grid) */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} KIVO Systems Inc. All architectural rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>SHA-256 Verified</span>
            <span>•</span>
            <span>Node.js 24 LTS Native</span>
            <span>•</span>
            <span>pnpm 10.5.2</span>
          </div>
        </div>
      </div>

      {/* Topographic Spatial Wireframe Horizon SVG */}
      <div className="w-full h-24 opacity-25 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <defs>
            <linearGradient id="wireframeFade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Horizontal Perspective Lines */}
          <line x1="0" y1="20" x2="1200" y2="20" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="0" y1="45" x2="1200" y2="45" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="0" y1="75" x2="1200" y2="75" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="0" y1="110" x2="1200" y2="110" stroke="url(#wireframeFade)" strokeWidth="0.8" />

          {/* Vanishing Point Perspective Traces */}
          <line x1="600" y1="0" x2="0" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="200" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="400" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="500" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="600" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="700" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="800" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="1000" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
          <line x1="600" y1="0" x2="1200" y2="120" stroke="url(#wireframeFade)" strokeWidth="0.8" />
        </svg>
      </div>
    </footer>
  );
}
