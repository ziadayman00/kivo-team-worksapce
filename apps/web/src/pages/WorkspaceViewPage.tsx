import { useState, FormEvent, useEffect, useId } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { ApiError, WorkspaceMemberDto, WorkspaceInvitationDto } from '@kivo/api-client';
import { WorkspaceSwitcher } from '../components/workspace/WorkspaceSwitcher';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  Settings,
  Users,
  Mail,
  UserPlus,
  Trash2,
  Ban,
  RotateCcw,
  Copy,
} from 'lucide-react';

export function WorkspaceViewPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const queryClient = useQueryClient();
  const nameInputId = useId();
  const inviteEmailId = useId();

  const [editName, setEditName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Fetch workspace details
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

  // 1b. Fetch all accessible workspaces for the switcher
  const { data: accessibleWorkspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await apiClient.workspaces.list();
      return res.data?.workspaces ?? [];
    },
  });

  // 2. Fetch workspace members
  const { data: members, isLoading: isMembersLoading } = useQuery({
    queryKey: ['workspaces', workspaceSlug, 'members'],
    queryFn: async () => {
      if (!workspaceSlug) return [];
      const res = await apiClient.workspaces.listMembers(workspaceSlug);
      return res.data?.members ?? [];
    },
    enabled: Boolean(workspaceSlug && workspace),
  });

  const isOwnerOrAdmin = workspace?.role === 'OWNER' || workspace?.role === 'ADMIN';

  // 3. Fetch workspace invitations (Owner / Admin only)
  const { data: invitations, isLoading: isInvitationsLoading } = useQuery({
    queryKey: ['workspaces', workspaceSlug, 'invitations'],
    queryFn: async () => {
      if (!workspaceSlug) return [];
      const res = await apiClient.workspaces.listInvitations(workspaceSlug);
      return res.data?.invitations ?? [];
    },
    enabled: Boolean(workspaceSlug && workspace && isOwnerOrAdmin),
  });

  useEffect(() => {
    if (workspace?.name) {
      setEditName(workspace.name);
    }
  }, [workspace?.name]);

  // Mutation: Update workspace settings
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

  // Mutation: Create invitation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!workspaceSlug) return;
      const res = await apiClient.workspaces.createInvitation(workspaceSlug, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      return res.data?.invitation;
    },
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'invitations'] });
      setInviteEmail('');
      setErrorMessage(null);
      if (invitation?.token) {
        const fullLink = `${window.location.origin}/invite/${invitation.token}`;
        setGeneratedInviteLink(fullLink);
      }
      setSuccessMessage('Invitation sent successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send invitation.');
      }
    },
  });

  // Mutation: Revoke invitation
  const revokeInviteMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!workspaceSlug) return;
      const res = await apiClient.workspaces.revokeInvitation(workspaceSlug, invitationId);
      return res.data?.invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'invitations'] });
      setSuccessMessage('Invitation revoked.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to revoke invitation.');
    },
  });

  // Mutation: Update member role / status
  const updateMemberMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
      status,
    }: {
      memberId: string;
      role?: 'ADMIN' | 'MEMBER';
      status?: 'ACTIVE' | 'SUSPENDED';
    }) => {
      if (!workspaceSlug) return;
      const res = await apiClient.workspaces.updateMember(workspaceSlug, memberId, {
        role,
        status,
      });
      return res.data?.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'members'] });
      setSuccessMessage('Member updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update member.');
    },
  });

  // Mutation: Remove member
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!workspaceSlug) return;
      const res = await apiClient.workspaces.removeMember(workspaceSlug, memberId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'members'] });
      setSuccessMessage('Member removed from workspace.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to remove member.');
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

  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    inviteMutation.mutate();
  };

  const handleCopyLink = () => {
    if (generatedInviteLink) {
      navigator.clipboard.writeText(generatedInviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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
              <WorkspaceSwitcher
                currentWorkspaceSlug={workspace.slug}
                accessibleWorkspaces={
                  accessibleWorkspaces.length > 0
                    ? accessibleWorkspaces
                    : [
                        {
                          id: workspace.id,
                          name: workspace.name,
                          slug: workspace.slug,
                          role: workspace.role,
                        },
                      ]
                }
                currentRole={workspace.role}
              />
              <div className="hidden sm:block">
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

        {/* Members Management Section */}
        <section
          aria-labelledby="members-heading"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h2 id="members-heading" className="text-base font-semibold text-white">
                Workspace Members
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              {members?.length || 0} active member{members?.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {isMembersLoading ? (
              <p className="py-4 text-xs text-zinc-400">Loading members...</p>
            ) : members && members.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    {isOwnerOrAdmin && <th className="pb-3 font-medium text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {members.map((member: WorkspaceMemberDto) => (
                    <tr key={member.id} className="hover:bg-zinc-800/20">
                      <td className="py-3 font-medium text-white">{member.displayName}</td>
                      <td className="py-3 text-zinc-400">{member.email}</td>
                      <td className="py-3">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            member.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      {isOwnerOrAdmin && (
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role promote/demote (Owner only) */}
                            {workspace.role === 'OWNER' && member.role !== 'OWNER' && (
                              <button
                                type="button"
                                title={
                                  member.role === 'MEMBER' ? 'Promote to Admin' : 'Demote to Member'
                                }
                                onClick={() =>
                                  updateMemberMutation.mutate({
                                    memberId: member.id,
                                    role: member.role === 'MEMBER' ? 'ADMIN' : 'MEMBER',
                                  })
                                }
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Suspend / Reactivate */}
                            {member.role !== 'OWNER' && (
                              <button
                                type="button"
                                title={
                                  member.status === 'ACTIVE'
                                    ? 'Suspend Member'
                                    : 'Reactivate Member'
                                }
                                onClick={() =>
                                  updateMemberMutation.mutate({
                                    memberId: member.id,
                                    status: member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                                  })
                                }
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Remove member */}
                            {member.role !== 'OWNER' && (
                              <button
                                type="button"
                                title="Remove Member"
                                onClick={() => removeMemberMutation.mutate(member.id)}
                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-4 text-xs text-zinc-500">No members found.</p>
            )}
          </div>
        </section>

        {/* Invitations Section (Owner / Admin) */}
        {isOwnerOrAdmin && (
          <section
            aria-labelledby="invitations-heading"
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-400" />
                <h2 id="invitations-heading" className="text-base font-semibold text-white">
                  Invitations
                </h2>
              </div>
            </div>

            {/* Invite Form */}
            <form
              onSubmit={handleInviteSubmit}
              className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label
                  htmlFor={inviteEmailId}
                  className="block text-xs font-medium uppercase tracking-wider text-zinc-400"
                >
                  Invite by Email
                </label>
                <input
                  id={inviteEmailId}
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="w-32">
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviteMutation.isPending || !inviteEmail.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}</span>
              </button>
            </form>

            {/* Generated Invite Link Notification */}
            {generatedInviteLink && (
              <div className="mt-4 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs">
                <span className="font-semibold text-indigo-300">Invite Link Generated:</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 rounded border border-indigo-500/30 bg-zinc-950 px-2.5 py-1.5 font-mono text-zinc-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pending Invitations Table */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pending & Recent Invitations
              </h3>
              <div className="mt-2 overflow-x-auto">
                {isInvitationsLoading ? (
                  <p className="py-2 text-xs text-zinc-400">Loading invitations...</p>
                ) : invitations && invitations.length > 0 ? (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="pb-2 font-medium">Email</th>
                        <th className="pb-2 font-medium">Role</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Expires</th>
                        <th className="pb-2 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {invitations.map((inv: WorkspaceInvitationDto) => (
                        <tr key={inv.id}>
                          <td className="py-2.5 text-zinc-300 font-mono">{inv.email}</td>
                          <td className="py-2.5 text-zinc-400 uppercase text-[10px]">{inv.role}</td>
                          <td className="py-2.5">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                inv.status === 'PENDING'
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : inv.status === 'ACCEPTED'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-zinc-500">
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 text-right">
                            {inv.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => revokeInviteMutation.mutate(inv.id)}
                                className="text-[11px] text-red-400 hover:underline"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="py-2 text-xs text-zinc-500">No invitations issued yet.</p>
                )}
              </div>
            </div>
          </section>
        )}

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
