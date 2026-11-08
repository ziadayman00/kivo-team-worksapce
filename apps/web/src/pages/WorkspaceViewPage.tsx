import { useState, FormEvent, useEffect, useId } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { ApiError } from '@kivo/api-client';
import { ArrowLeft, Building, ShieldCheck, Check, Settings } from 'lucide-react';

export function WorkspaceViewPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const queryClient = useQueryClient();
  const nameInputId = useId();

  const [editName, setEditName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: workspace,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['workspaces', workspaceSlug],
    queryFn: async () => {
      if (!workspaceSlug) throw new Error('Workspace slug is missing.');
      const res = await apiClient.workspaces.getBySlug(workspaceSlug);
      return res.data?.workspace;
    },
    retry: false,
  });

  useEffect(() => {
    if (workspace?.name) {
      setEditName(workspace.name);
    }
  }, [workspace?.name]);

  const updateMutation = useMutation({
    mutationFn: async (newName: string) => {
      if (!workspaceSlug) return;
      const res = await apiClient.workspaces.update(workspaceSlug, { name: newName });
      return res.data?.workspace;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['workspaces', workspaceSlug], updated);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSuccessMessage('Workspace settings updated successfully.');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to update workspace settings.');
      }
    },
  });

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMessage('Workspace name cannot be empty.');
      return;
    }
    updateMutation.mutate(editName.trim());
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200" />
          <p className="text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    const errorMsg =
      error instanceof ApiError || error instanceof Error
        ? error.message
        : 'Workspace could not be loaded or you do not have permission to view it.';

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <div className="max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <div
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {errorMsg}
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnerOrAdmin = workspace.role === 'OWNER' || workspace.role === 'ADMIN';

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-500/20">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">{workspace.name}</h1>
                <p className="font-mono text-xs text-zinc-400">/{workspace.slug}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              {workspace.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerts */}
        {successMessage && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400"
          >
            <Check className="h-4 w-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {errorMessage}
          </div>
        )}

        {/* Workspace Overview & Profile */}
        <section
          aria-labelledby="overview-heading"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 id="overview-heading" className="text-lg font-semibold text-white">
              Workspace Overview
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Multi-Tenant Boundary Enforced</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Workspace ID</span>
              <p className="mt-1 font-mono text-xs text-zinc-300 truncate" title={workspace.id}>
                {workspace.id}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Route Slug</span>
              <p className="mt-1 font-mono text-xs text-indigo-300">{workspace.slug}</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <span className="text-xs uppercase tracking-wider text-zinc-500">Your Role</span>
              <p className="mt-1 text-xs font-semibold uppercase text-zinc-200">{workspace.role}</p>
            </div>
          </div>
        </section>

        {/* Settings / Edit Section (Owner / Admin) */}
        {isOwnerOrAdmin && (
          <section
            aria-labelledby="settings-heading"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400" />
              <h2 id="settings-heading" className="text-base font-semibold text-white">
                Workspace Profile Settings
              </h2>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 max-w-lg space-y-4">
              <div>
                <label
                  htmlFor={nameInputId}
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Workspace Name
                </label>
                <input
                  id={nameInputId}
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending || editName === workspace.name}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
