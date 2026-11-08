import { useState } from 'react';
import { Copy, Check, Cpu, Database, ShieldCheck, Terminal } from 'lucide-react';

export function ArchitectureSection() {
  const [copied, setCopied] = useState(false);

  const codeSnippet = `// Strict Modular Boundary: apps/api/src/modules/workspace/workspace.service.ts
import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.constants';
import * as schema from '../../database/schema';

@Injectable()
export class WorkspaceService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async getWorkspaceBySlug(accountId: string, slug: string) {
    // 1. Strict Tenant Boundary Isolation
    const [workspace] = await this.db
      .select()
      .from(schema.workspaces)
      .where(and(eq(schema.workspaces.slug, slug), eq(schema.workspaces.status, 'ACTIVE')))
      .limit(1);

    // 2. Verified Active Membership Gate (403 on non-member or suspended)
    const [membership] = await this.db
      .select()
      .from(schema.workspaceMemberships)
      .where(and(
        eq(schema.workspaceMemberships.workspaceId, workspace.id),
        eq(schema.workspaceMemberships.accountId, accountId),
        eq(schema.workspaceMemberships.status, 'ACTIVE'),
      ));

    if (!membership) {
      throw new ForbiddenException('You do not have access to this workspace.');
    }

    return { ...workspace, role: membership.role };
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modules = [
    { name: 'IdentityModule', role: 'Authentication & Argon2id Credentials' },
    { name: 'WorkspaceModule', role: 'Tenant Boundaries & Single-Use Invitations' },
    { name: 'AuthorizationModule', role: 'RBAC, Invalidation & Policy Gates' },
    { name: 'WorkManagementModule', role: 'Cycles, Projects & Work Hierarchies' },
    { name: 'CollaborationModule', role: 'Contextual Threads & Direct Discussions' },
    { name: 'ActivityModule', role: 'Audit Log Streams & Historical Events' },
    { name: 'NotificationModule', role: 'SSE Real-Time Push Delivery' },
    { name: 'SearchModule', role: 'Cross-Entity Unified Index' },
  ];

  return (
    <section id="architecture" className="py-24 bg-[#07070a] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Details */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-mono text-indigo-400">
              <Cpu className="h-3.5 w-3.5" />
              <span>Engineering First Principles (ADR-001)</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              No Premature Microservices.
              <span className="block text-indigo-400 mt-1">Strict Modular Monolith.</span>
            </h2>

            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              We reject the microservice craze that adds distributed transaction latency, network
              serialization overhead, and failure points. KIVO delivers enterprise scale via 8
              strictly encapsulated domain modules, verified continuously by static architectural
              boundary gates.
            </p>

            {/* Modules Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {modules.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/[0.06] bg-zinc-900/40 p-2.5 transition hover:border-white/[0.12]"
                >
                  <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    {m.name}
                  </span>
                  <p className="mt-1 text-[11px] text-zinc-400">{m.role}</p>
                </div>
              ))}
            </div>

            {/* Key Invariant Highlights */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Zero Cross-Module Internal Imports</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-400" />
                <span>PostgreSQL Native Transactions</span>
              </div>
            </div>
          </div>

          {/* Right Code Display */}
          <div className="rounded-2xl border border-white/[0.1] bg-[#050508] shadow-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0c0d12] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[11px] text-zinc-300">workspace.service.ts</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-300 transition hover:bg-zinc-700"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="p-4 overflow-x-auto text-[11px] leading-relaxed text-zinc-300 max-h-[460px]">
              <pre>
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
