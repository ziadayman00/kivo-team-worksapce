import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { ApiError } from '@kivo/api-client';
import { Building, ShieldCheck, Check, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch current auth user (if signed in)
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.auth.me();
        return res.data?.account ?? null;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  // 2. Fetch invitation details by token
  const {
    data: invitation,
    isLoading: isInviteLoading,
    error: inviteError,
  } = useQuery({
    queryKey: ['invitations', token],
    queryFn: async () => {
      if (!token) throw new Error('Invitation token is required.');
      const res = await apiClient.invitations.getByToken(token);
      return res.data?.invitation;
    },
    retry: false,
  });

  // 3. Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Token is missing.');
      const res = await apiClient.invitations.accept(token);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (data?.workspace?.slug) {
        navigate(`/workspaces/${data.workspace.slug}`);
      } else {
        navigate('/');
      }
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to accept invitation.');
      }
    },
  });

  const isLoading = isAuthLoading || isInviteLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-200" />
          <p className="text-sm">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (inviteError || !invitation) {
    const errorText =
      inviteError instanceof ApiError || inviteError instanceof Error
        ? inviteError.message
        : 'Invitation not found or has expired.';

    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 text-zinc-100">
        <div className="max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Invalid or Expired Invitation</h2>
          <p className="text-sm text-zinc-400">{errorText}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = authData;
  const isEmailMatching =
    currentUser && currentUser.email.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/30">
            <Building className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-white">Workspace Invitation</h1>
          <p className="mt-2 text-sm text-zinc-400">
            You've been invited to join{' '}
            <span className="font-semibold text-white">{invitation.workspace.name}</span> as{' '}
            <span className="font-mono text-indigo-400">{invitation.role}</span>.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {errorMessage}
          </div>
        )}

        {/* Identity & Status Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Invited Email</span>
            <span className="font-mono text-zinc-200">{invitation.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Workspace Slug</span>
            <span className="font-mono text-indigo-300">/{invitation.workspace.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Expires At</span>
            <span className="text-zinc-400">
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Controls based on Auth state */}
        {!currentUser ? (
          <div className="space-y-3 pt-2">
            <p className="text-center text-xs text-zinc-400">
              Please sign in to your account to accept this invitation.
            </p>
            <Link
              to={`/login?redirect=/invite/${token}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500"
            >
              <span>Sign In to Accept</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={`/register?redirect=/invite/${token}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <span>Create an Account</span>
            </Link>
          </div>
        ) : isEmailMatching ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              <UserCheck className="h-4 w-4 flex-shrink-0" />
              <span>Signed in as {currentUser.email} (Email matches invitation)</span>
            </div>

            <button
              type="button"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>
                {acceptMutation.isPending ? 'Joining Workspace...' : 'Accept & Join Workspace'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
              <p className="font-semibold">Email Mismatch</p>
              <p className="mt-1">
                You are currently signed in as <strong>{currentUser.email}</strong>, but this
                invitation was addressed to <strong>{invitation.email}</strong>.
              </p>
            </div>
            <p className="text-center text-xs text-zinc-400">
              Please sign out and sign in with the invited email address to accept.
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Tenant boundary securely enforced</span>
        </div>
      </div>
    </div>
  );
}
