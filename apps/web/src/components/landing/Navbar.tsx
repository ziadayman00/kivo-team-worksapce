import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Menu, X, Command } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#050507]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-black border border-white/[0.15] font-black text-white shadow-lg transition group-hover:border-emerald-500/50">
              <span className="bg-gradient-to-br from-white via-zinc-200 to-emerald-400 bg-clip-text text-transparent text-sm">
                K
              </span>
              <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-0 group-hover:opacity-30 blur-sm transition" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                KIVO
                <span className="text-[10px] text-zinc-500 font-normal">OS</span>
              </span>
            </div>
          </Link>

          {/* Monospaced Technical Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[11px] font-mono tracking-tight text-zinc-400">
            <a href="#cycles" className="transition hover:text-emerald-400">
              <span className="text-zinc-600 mr-1">01/</span>CYCLES
            </a>
            <a href="#threads" className="transition hover:text-emerald-400">
              <span className="text-zinc-600 mr-1">02/</span>THREADS
            </a>
            <a href="#isolation" className="transition hover:text-emerald-400">
              <span className="text-zinc-600 mr-1">03/</span>ISOLATION
            </a>
            <a href="#comparison" className="transition hover:text-emerald-400">
              <span className="text-zinc-600 mr-1">04/</span>COMPARISON
            </a>
            <a href="#pricing" className="transition hover:text-emerald-400">
              <span className="text-zinc-600 mr-1">05/</span>PRICING
            </a>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/60 px-2.5 py-1 text-[11px] font-mono text-zinc-400">
            <Command className="h-3 w-3 text-zinc-500" />
            <span>K</span>
            <span className="text-zinc-600 ml-1">Quick Action</span>
          </div>

          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <span>LAUNCH APP &rarr;</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3 text-xs font-mono">
              <Link to="/login" className="text-zinc-400 transition hover:text-white px-2 py-1">
                SIGN IN
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 font-bold text-zinc-950 shadow-md shadow-white/10 transition hover:bg-zinc-200"
              >
                <span>GET STARTED</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/[0.08] bg-zinc-950 px-4 py-4 md:hidden space-y-3 font-mono text-xs">
          <nav className="flex flex-col gap-2 text-zinc-400">
            <a
              href="#section-cycles"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-400"
            >
              01 // CYCLES
            </a>
            <a
              href="#section-threads"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-400"
            >
              02 // THREADS
            </a>
            <a
              href="#section-isolation"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-400"
            >
              03 // ISOLATION
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-400"
            >
              04 // ARCHITECTURE
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-emerald-400"
            >
              05 // PRICING
            </a>
          </nav>

          <div className="pt-3 border-t border-zinc-900 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 font-semibold text-emerald-400"
              >
                <span>LAUNCH APP &rarr;</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-300"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 font-bold text-zinc-950"
                >
                  <span>GET STARTED FREE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
