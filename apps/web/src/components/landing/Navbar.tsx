import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 font-black text-white shadow-md shadow-indigo-500/20 transition group-hover:scale-105">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                KIVO
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-400">
                  v1.0
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#bento" className="transition hover:text-white">
              Capabilities
            </a>
            <a href="#demo" className="transition hover:text-white">
              Interactive Demo
            </a>
            <a href="#architecture" className="transition hover:text-white">
              Architecture
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] font-mono text-zinc-400">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>PostgreSQL 17 Native</span>
          </div>

          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-zinc-300 transition hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-950 shadow-md shadow-white/10 transition hover:bg-zinc-200"
              >
                <span>Get Started</span>
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
        <div className="border-b border-white/[0.08] bg-zinc-950 px-4 py-4 md:hidden space-y-3">
          <nav className="flex flex-col gap-2 text-sm text-zinc-300">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Features
            </a>
            <a
              href="#bento"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Capabilities
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Interactive Demo
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Architecture
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Pricing
            </a>
          </nav>
          <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
              >
                <span>Launch App</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950"
                >
                  <span>Get Started Free</span>
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
