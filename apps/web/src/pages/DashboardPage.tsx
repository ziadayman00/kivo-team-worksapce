import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ShieldCheck } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      {/* Top Navigation */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-500/20">
              K
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">KIVO</h1>
              <p className="text-xs text-zinc-400">Team Operating System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-400 font-semibold uppercase">
                {user?.displayName ? user.displayName.charAt(0) : 'U'}
              </div>
              <span className="font-medium text-white">{user?.displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="status-heading" className="space-y-6">
          {/* Status Banner */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 id="status-heading" className="text-xl font-semibold text-white">
              Application Foundation
            </h2>
            <p data-testid="app-status" className="mt-2 text-sm text-zinc-400">
              Status: Initialized
            </p>
          </div>

          {/* User Account Info Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">Authenticated Account Profile</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Account ID</span>
                <p className="mt-1 font-mono text-sm text-zinc-300 truncate" title={user?.id}>
                  {user?.id}
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">Display Name</span>
                <p className="mt-1 text-sm font-medium text-zinc-200">{user?.displayName}</p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-4">
                <span className="text-xs uppercase tracking-wider text-zinc-500">
                  Email Address
                </span>
                <p className="mt-1 text-sm font-medium text-zinc-200">{user?.email}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Session verified via authoritative server-side cookie (HTTP-only, Secure)</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
