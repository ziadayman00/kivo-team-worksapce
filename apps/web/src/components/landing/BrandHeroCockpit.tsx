import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Sparkles, Command, ArrowRight, Send, Zap } from 'lucide-react';

interface WorkspaceContext {
  id: string;
  name: string;
  region: string;
  ping: number;
  activeCycle: string;
  cycleProgress: number;
  tickets: Array<{
    id: string;
    title: string;
    priority: 'URGENT' | 'HIGH' | 'NORMAL';
    status: 'DONE' | 'IN_PROGRESS' | 'TODO';
    points: number;
    assignee: string;
  }>;
  activeThread: {
    ticketId: string;
    ticketTitle: string;
    messages: Array<{
      sender: string;
      role: string;
      text: string;
      time: string;
      code?: string;
    }>;
  };
}

const WORKSPACES: Record<string, WorkspaceContext> = {
  'stripe-core': {
    id: 'stripe-core',
    name: 'Stripe Payments Infra',
    region: 'us-east-1 (N. Virginia)',
    ping: 9,
    activeCycle: 'Cycle 14: Latency Sprints',
    cycleProgress: 88,
    tickets: [
      {
        id: 'STP-401',
        title: 'Argon2id credential hash upgrade',
        priority: 'URGENT',
        status: 'DONE',
        points: 8,
        assignee: 'ZA',
      },
      {
        id: 'STP-402',
        title: 'PostgreSQL SKIP LOCKED outbox poller',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        points: 13,
        assignee: 'SC',
      },
      {
        id: 'STP-403',
        title: 'SHA-256 single-use token lifecycle',
        priority: 'HIGH',
        status: 'TODO',
        points: 5,
        assignee: 'EL',
      },
      {
        id: 'STP-404',
        title: 'Sub-millisecond IPC boundary verify',
        priority: 'NORMAL',
        status: 'TODO',
        points: 3,
        assignee: 'MK',
      },
    ],
    activeThread: {
      ticketId: 'STP-402',
      ticketTitle: 'PostgreSQL SKIP LOCKED outbox poller',
      messages: [
        {
          sender: 'Sarah Chen',
          role: 'Staff Architect',
          time: '10:41 AM',
          text: 'Using FOR UPDATE SKIP LOCKED eliminates cross-worker contention entirely under 10k req/sec.',
          code: `SELECT * FROM outbox_events WHERE status = 'PENDING' LIMIT 50 FOR UPDATE SKIP LOCKED;`,
        },
        {
          sender: 'Ziad Ayman',
          role: 'Principal Engineer',
          time: '10:45 AM',
          text: 'Verified in native PG17 test harness. Eventual consistency latency dropped to 1.8ms.',
        },
      ],
    },
  },
  'vercel-edge': {
    id: 'vercel-edge',
    name: 'Vercel Edge Runtime',
    region: 'eu-central-1 (Frankfurt)',
    ping: 14,
    activeCycle: 'Cycle 28: Zero-Cold-Start',
    cycleProgress: 94,
    tickets: [
      {
        id: 'VCL-811',
        title: 'Turbopack persistent cache hydration',
        priority: 'URGENT',
        status: 'DONE',
        points: 13,
        assignee: 'LK',
      },
      {
        id: 'VCL-812',
        title: 'Multi-tenant isolate memory fences',
        priority: 'HIGH',
        status: 'DONE',
        points: 8,
        assignee: 'RM',
      },
      {
        id: 'VCL-813',
        title: 'Edge middleware cookie encryption',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        points: 5,
        assignee: 'ZA',
      },
    ],
    activeThread: {
      ticketId: 'VCL-812',
      ticketTitle: 'Multi-tenant isolate memory fences',
      messages: [
        {
          sender: 'Robin Marx',
          role: 'Kernel Specialist',
          time: '09:12 AM',
          text: 'Zero memory leakage across isolates. Every tenant process runs in a sandboxed V8 context.',
        },
      ],
    },
  },
  'neon-db': {
    id: 'neon-db',
    name: 'Neon Autoscaling Engine',
    region: 'ap-southeast-1 (Singapore)',
    ping: 21,
    activeCycle: 'Cycle 09: Branching V2',
    cycleProgress: 75,
    tickets: [
      {
        id: 'NEO-109',
        title: 'Instant point-in-time copy-on-write',
        priority: 'URGENT',
        status: 'DONE',
        points: 13,
        assignee: 'HE',
      },
      {
        id: 'NEO-110',
        title: 'Pageserver compute cache prefetching',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        points: 8,
        assignee: 'AR',
      },
      {
        id: 'NEO-111',
        title: 'Safekeeper quorum lease timeout',
        priority: 'NORMAL',
        status: 'TODO',
        points: 5,
        assignee: 'ZA',
      },
    ],
    activeThread: {
      ticketId: 'NEO-109',
      ticketTitle: 'Instant point-in-time copy-on-write',
      messages: [
        {
          sender: 'Heikki Linnakangas',
          role: 'Database Architect',
          time: '11:20 AM',
          text: 'Branch created in 420ms. WAL stream resumed without blocking the primary branch.',
        },
      ],
    },
  },
};

export function BrandHeroCockpit() {
  const [selectedWsKey, setSelectedWsKey] = useState<string>('stripe-core');
  const [activeTab, setActiveTab] = useState<'cockpit' | 'circuit'>('cockpit');
  const [activeTickets, setActiveTickets] = useState(WORKSPACES['stripe-core']!.tickets);
  const [newMsg, setNewMsg] = useState('');
  const [threadMsgs, setThreadMsgs] = useState(WORKSPACES['stripe-core']!.activeThread.messages);

  const currentWs = WORKSPACES[selectedWsKey] ?? WORKSPACES['stripe-core']!;

  // Switch workspace
  useEffect(() => {
    setActiveTickets(currentWs.tickets);
    setThreadMsgs(currentWs.activeThread.messages);
  }, [selectedWsKey, currentWs]);

  // Status toggle
  const toggleStatus = (id: string) => {
    setActiveTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: 'DONE' | 'IN_PROGRESS' | 'TODO' =
          t.status === 'TODO' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        return { ...t, status: next };
      }),
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setThreadMsgs((prev) => [
      ...prev,
      {
        sender: 'You (Verified Lead)',
        role: 'Session Owner',
        time: 'Just now',
        text: newMsg.trim(),
      },
    ]);
    setNewMsg('');
  };

  return (
    <div className="w-full relative mt-12 rounded-2xl border border-emerald-500/30 bg-[#07080c] shadow-[0_0_80px_rgba(16,185,129,0.12)] overflow-hidden">
      {/* Outer Glow Halo & Corner Circuit Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Top Cockpit Title & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#0c0d14] px-5 py-3 gap-3">
        {/* Left: Window Controls + Live Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>

          <div className="h-4 w-[1px] bg-white/[0.1] mx-1" />

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              KIVO OS // LIVE COCKPIT
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300 font-medium">{currentWs.name}</span>
          </div>
        </div>

        {/* Center / Right: Mode Switcher & Telemetry Pill */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex rounded-lg border border-white/[0.08] bg-black/50 p-0.5 text-[11px]">
            <button
              onClick={() => setActiveTab('cockpit')}
              className={`px-3 py-1 rounded transition ${
                activeTab === 'cockpit'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Unified Cockpit
            </button>
            <button
              onClick={() => setActiveTab('circuit')}
              className={`px-3 py-1 rounded transition ${
                activeTab === 'circuit'
                  ? 'bg-emerald-500 text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Postgres Topology
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-md bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-300">
            <Zap className="h-3 w-3 text-emerald-400 animate-bounce" />
            <span>{currentWs.ping}ms ping</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{currentWs.region}</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Pane Cockpit Body */}
      {activeTab === 'cockpit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* Rail 1: Workspaces & Sprint Velocity (Cols 1-3) */}
          <div className="lg:col-span-3 border-r border-white/[0.06] bg-[#08090e] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-3">
                <span>Select Tenant Space</span>
                <span className="text-emerald-400">3 Isolated</span>
              </div>

              {/* Workspace Switcher Pills */}
              <div className="space-y-2">
                {Object.values(WORKSPACES).map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => setSelectedWsKey(ws.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      selectedWsKey === ws.id
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-sm'
                        : 'border-white/[0.04] bg-zinc-950/40 hover:border-white/[0.12] hover:bg-zinc-900/40'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${selectedWsKey === ws.id ? 'bg-emerald-400' : 'bg-zinc-600'}`}
                        />
                        {ws.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate max-w-[140px]">
                        {ws.name}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {ws.ping}ms
                    </span>
                  </button>
                ))}
              </div>

              {/* Velocity Burndown Arc */}
              <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/50 p-4 font-mono">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>CYCLE VELOCITY</span>
                  <span className="text-emerald-400 font-bold">{currentWs.cycleProgress}%</span>
                </div>
                <div className="mt-2.5 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
                    style={{ width: `${currentWs.cycleProgress}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[10px] text-zinc-500">
                  <span>{currentWs.activeCycle}</span>
                </div>
              </div>
            </div>

            {/* Bottom Keyboard Pro-tip */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-2 font-mono text-[11px] text-zinc-500">
              <Command className="h-3.5 w-3.5 text-zinc-400" />
              <span>
                Press <kbd className="text-zinc-300 bg-zinc-800 px-1 rounded">⌘K</kbd> to jump
                anywhere
              </span>
            </div>
          </div>

          {/* Rail 2: Sprint Work Items (Cols 4-7) */}
          <div className="lg:col-span-5 border-r border-white/[0.06] bg-[#090a10] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/[0.06] pb-3 mb-4">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span>ACTIVE CYCLE ITEMS</span>
                  <span className="text-zinc-500 font-normal">({activeTickets.length})</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Click to toggle status
                </span>
              </div>

              {/* Tickets list */}
              <div className="space-y-2.5">
                {activeTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleStatus(t.id)}
                    className="group flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-zinc-950/70 hover:border-emerald-500/40 hover:bg-zinc-900/60 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`h-4 w-4 rounded flex items-center justify-center transition ${
                          t.status === 'DONE'
                            ? 'bg-emerald-500 text-black'
                            : t.status === 'IN_PROGRESS'
                              ? 'border border-amber-400 text-amber-400'
                              : 'border border-zinc-700'
                        }`}
                      >
                        {t.status === 'DONE' && <CheckCircle2 className="h-3 w-3" />}
                        {t.status === 'IN_PROGRESS' && <Clock className="h-2.5 w-2.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-emerald-400">
                            {t.id}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              t.status === 'DONE' ? 'line-through text-zinc-500' : 'text-zinc-200'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold ${
                          t.priority === 'URGENT'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : t.priority === 'HIGH'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="h-5 w-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 font-mono text-[9px] text-indigo-200 flex items-center justify-center">
                        {t.assignee}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Filter: [All] [My Issues] [Urgent]</span>
              <span className="text-zinc-400">Showing 4 of 4 items</span>
            </div>
          </div>

          {/* Rail 3: Anchored Discussion & Context Vault (Cols 8-12) */}
          <div className="lg:col-span-4 bg-[#07080d] p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Context Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <div>
                  <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    CONTEXT THREAD // {currentWs.activeThread.ticketId}
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5 truncate max-w-[220px]">
                    {currentWs.activeThread.ticketTitle}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SSE Live
                </span>
              </div>

              {/* Conversation Messages */}
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {threadMsgs.map((msg, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white">{msg.sender}</span>
                      <span className="text-zinc-500">{msg.time}</span>
                    </div>
                    <p className="mt-1.5 text-zinc-300 font-sans text-xs leading-relaxed">
                      {msg.text}
                    </p>
                    {msg.code && (
                      <div className="mt-2 rounded-lg bg-black/80 border border-white/[0.08] p-2 text-[10px] text-emerald-300 overflow-x-auto">
                        <code>{msg.code}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Anchor a decision or code review..."
                className="flex-1 rounded-lg border border-white/[0.1] bg-black/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1 transition"
              >
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* PostgreSQL 17 Native Topology Inspector View */
        <div className="p-8 bg-[#07080c] font-mono text-xs text-zinc-300 min-h-[520px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-white font-bold text-sm">
                  PostgreSQL 17 Native Multi-Tenant Schema
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                100% Shared-Table Tenant Isolation (ADR-003)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-white/[0.08] bg-black/60 p-4">
                <div className="text-emerald-400 font-bold mb-2">TABLE: workspaces</div>
                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <div>
                    id: <span className="text-zinc-200">uuid PRIMARY KEY</span>
                  </div>
                  <div>
                    name: <span className="text-zinc-200">varchar(255)</span>
                  </div>
                  <div>
                    slug: <span className="text-amber-400">varchar(63) UNIQUE</span>
                  </div>
                  <div>
                    status: <span className="text-zinc-200">workspace_status</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-black/60 p-4">
                <div className="text-indigo-400 font-bold mb-2">TABLE: workspace_memberships</div>
                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <div>
                    workspace_id: <span className="text-emerald-400">uuid FK (INDEX)</span>
                  </div>
                  <div>
                    account_id: <span className="text-zinc-200">uuid FK</span>
                  </div>
                  <div>
                    role: <span className="text-amber-400">OWNER | ADMIN | MEMBER</span>
                  </div>
                  <div>
                    status: <span className="text-zinc-200">ACTIVE | SUSPENDED</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-black/60 p-4">
                <div className="text-cyan-400 font-bold mb-2">TABLE: transactional_outbox</div>
                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <div>
                    id: <span className="text-zinc-200">uuid PRIMARY KEY</span>
                  </div>
                  <div>
                    event_type: <span className="text-zinc-200">varchar(128)</span>
                  </div>
                  <div>
                    payload: <span className="text-emerald-400">jsonb</span>
                  </div>
                  <div>
                    consumer: <span className="text-amber-400">SKIP LOCKED Poller</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-center justify-between text-xs text-emerald-300">
            <span>
              Query Verification:{' '}
              <code className="text-white">
                SELECT * FROM workspaces WHERE id = current_setting(&apos;app.workspace_id&apos;)
              </code>
            </span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Verified Isolated (0.24ms)
            </span>
          </div>
        </div>
      )}

      {/* Bottom Command Dock Bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-white/[0.08] bg-[#050609] px-5 py-3 text-[11px] font-mono text-zinc-400 gap-3">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">Keyboard shortcuts:</span>
          <span>
            <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded">G</kbd> then{' '}
            <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded">C</kbd> Cycles
          </span>
          <span>
            <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded">G</kbd> then{' '}
            <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded">I</kbd> Issues
          </span>
          <span>
            <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded">G</kbd> then{' '}
            <kbd className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded">T</kbd> Threads
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <span>Explore Live Sandbox</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
