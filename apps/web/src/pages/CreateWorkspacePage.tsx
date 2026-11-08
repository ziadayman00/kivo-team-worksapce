import { useState, FormEvent, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { ApiError } from '@kivo/api-client';
import { ArrowLeft, Building2 } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CreateWorkspacePage() {
  const [name, setName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isCustomizingSlug, setIsCustomizingSlug] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameId = useId();
  const slugId = useId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const generatedSlug = isCustomizingSlug ? customSlug : slugify(name);

  const createMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      const slugToSend = generatedSlug.trim();
      const res = await apiClient.workspaces.create({
        name: trimmedName,
        slug: slugToSend || undefined,
      });
      return res.data?.workspace;
    },
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (workspace) {
        navigate(`/workspaces/${workspace.slug}`);
      } else {
        navigate('/');
      }
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create workspace.');
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }

    if (isCustomizingSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(customSlug)) {
      setError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-md">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Create a new workspace</h1>
            <p className="text-xs text-zinc-400">Set up your team&apos;s isolated environment</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor={nameId}
              className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Workspace Name
            </label>
            <input
              id={nameId}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Engineering"
              className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor={slugId}
                className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Workspace URL Slug
              </label>
              {!isCustomizingSlug && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomizingSlug(true);
                    setCustomSlug(slugify(name));
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Customize slug
                </button>
              )}
            </div>

            {isCustomizingSlug ? (
              <input
                id={slugId}
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                placeholder="acme-engineering"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-sm text-white placeholder-zinc-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <div className="mt-1.5 flex items-center rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-3.5 py-2.5 font-mono text-xs text-zinc-400">
                <span className="text-zinc-500">app.kivo.io/workspaces/</span>
                <span className="text-indigo-300">{generatedSlug || 'workspace-slug'}</span>
              </div>
            )}
            <p className="mt-1 text-xs text-zinc-500">
              Used for slug-based routing and deep linking across your workspace.
            </p>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Creating workspace...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
