import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import { LogOut, User, ShieldCheck, Plus, Building2, ChevronRight } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await apiClient.workspaces.list();
      return res.data?.workspaces ?? [];
    },
  });

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

          {/* Workspaces Section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Your Workspaces</h3>
              </div>
              <Link
                to="/create-workspace"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Create Workspace</span>
              </Link>
            </div>

            <div className="mt-4">
              {isLoadingWorkspaces ? (
                <div className="flex items-center gap-2 py-4 text-xs text-zinc-500">
                  <div className="h-4 w-4 animate-spin rounded-full border border-zinc-700 border-t-zinc-400" />
                  <span>Loading workspaces...</span>
                </div>
              ) : !workspaces || workspaces.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-zinc-600" />
                  <p className="mt-2 text-sm font-medium text-zinc-300">No workspaces yet</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Create a workspace to start organizing projects and collaborating with your
                    team.
                  </p>
                  <Link
                    to="/create-workspace"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create your first workspace</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {workspaces.map((ws) => (
                    <Link
                      key={ws.id}
                      to={`/workspaces/${ws.slug}`}
                      className="group flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/60"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-400">
                            {ws.name}
                          </span>
                          <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-indigo-400 border border-indigo-500/20">
                            {ws.role}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-zinc-500">/{ws.slug}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
