import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050507] text-zinc-400 text-xs">
      {/* Pre-footer Call to Action Banner */}
      <div className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-gradient-to-b from-indigo-950/20 via-zinc-950 to-[#050507]">
        <div className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 h-64 w-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Build the Future of Your Team Today.
          </h2>
          <p className="mt-4 text-sm text-zinc-400 max-w-xl mx-auto">
            Experience what happens when issue planning, contextual discussions, and multi-tenant
            governance work as one cohesive system.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 hover:scale-[1.02]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="https://github.com/ziadayman00/kivo-team-worksapce"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-zinc-900/80 px-6 py-3 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs">
                K
              </div>
              <span className="text-sm font-bold tracking-tight text-white">KIVO</span>
            </div>
            <p className="mt-3 text-xs text-zinc-500 max-w-xs leading-relaxed">
              The high-craft team operating system connecting planning, discussions, and
              multi-tenant governance into a unified workspace.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Product
            </h4>
            <ul className="mt-3 space-y-2 text-zinc-400">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Sprint Cycles
                </a>
              </li>
              <li>
                <a href="#bento" className="hover:text-white transition">
                  Contextual Threads
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white transition">
                  Interactive Sandbox
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
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="mt-3 space-y-2 text-zinc-400">
              <li>
                <a href="#architecture" className="hover:text-white transition">
                  Modular Monolith
                </a>
              </li>
              <li>
                <span className="text-zinc-500">PostgreSQL 17 RLS</span>
              </li>
              <li>
                <span className="text-zinc-500">Transactional Outbox</span>
              </li>
              <li>
                <span className="text-zinc-500">Argon2id + Opaque Sessions</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Open Source
            </h4>
            <ul className="mt-3 space-y-2 text-zinc-400">
              <li>
                <a
                  href="https://github.com/ziadayman00/kivo-team-worksapce"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Create Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} KIVO Systems. Built with precision and care.</p>
          <div className="flex items-center gap-4">
            <span>Node.js 24 LTS Verified</span>
            <span>•</span>
            <span>PostgreSQL 17 Native</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
