import { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Shield,
  Layers,
  Sparkles,
  Send,
  Terminal,
} from 'lucide-react';

interface SprintItem {
  id: string;
  title: string;
  status: 'DONE' | 'IN_PROGRESS' | 'TODO';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  points: number;
}

export function NumberedShowcase() {
  // Feature 01: Cycle Scrubber State
  const [selectedCycle, setSelectedCycle] = useState<'13' | '14' | '15'>('14');
  const [sprintItems, setSprintItems] = useState<Record<string, SprintItem[]>>({
    '13': [
      {
        id: 'ZIA-20',
        title: 'Argon2id credential hashing migration',
        status: 'DONE',
        priority: 'URGENT',
        points: 8,
      },
      {
        id: 'ZIA-21',
        title: 'Session invalidation token revocation',
        status: 'DONE',
        priority: 'HIGH',
        points: 5,
      },
      {
        id: 'ZIA-22',
        title: 'PostgreSQL 17 test harness lifecycle',
        status: 'DONE',
        priority: 'HIGH',
        points: 5,
      },
    ],
    '14': [
      {
        id: 'ZIA-25',
        title: 'Multi-tenant workspace boundary enforcement',
        status: 'DONE',
        priority: 'URGENT',
        points: 13,
      },
      {
        id: 'ZIA-26',
        title: 'Single-use SHA-256 invite token lifecycle',
        status: 'DONE',
        priority: 'HIGH',
        points: 8,
      },
      {
        id: 'ZIA-27',
        title: 'Transactional outbox SKIP LOCKED poller',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        points: 8,
      },
      {
        id: 'ZIA-28',
        title: 'Identity-bound invitation acceptance gate',
        status: 'TODO',
        priority: 'MEDIUM',
        points: 5,
      },
    ],
    '15': [
      {
        id: 'ZIA-30',
        title: 'Real-time SSE event bus streaming',
        status: 'TODO',
        priority: 'URGENT',
        points: 13,
      },
      {
        id: 'ZIA-31',
        title: 'Cross-entity lexical search index',
        status: 'TODO',
        priority: 'HIGH',
        points: 8,
      },
    ],
  });

  const toggleItemStatus = (cycleKey: string, id: string) => {
    setSprintItems((prev) => {
      const list = prev[cycleKey] ?? [];
      const updated: SprintItem[] = list.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: 'DONE' | 'IN_PROGRESS' | 'TODO' =
          item.status === 'TODO' ? 'IN_PROGRESS' : item.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        return { ...item, status: nextStatus };
      });
      return { ...prev, [cycleKey]: updated };
    });
  };

  // Feature 02: Thread Discussion State
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Ziad Ayman',
      role: 'Staff Architect',
      timestamp: '10:42 AM',
      avatar: 'ZA',
      text: 'Verified that the PostgreSQL 17 test harness cleans tables between runs. Multi-tenant isolation tests pass with zero leaks.',
      codeSnippet: `await db.delete(schema.workspaceMemberships).where(eq(schema.workspaceMemberships.workspaceId, workspace.id));`,
    },
    {
      id: 'c2',
      author: 'Sarah Chen',
      role: 'Security Lead',
      timestamp: '10:47 AM',
      avatar: 'SC',
      text: 'Confirmed single-use SHA-256 invite hashing. Expired tokens throw 410 Gone, already-accepted tokens reject atomically.',
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        author: 'Lead Reviewer',
        role: 'Verified Agent',
        timestamp: 'Just now',
        avatar: 'LR',
        text: newCommentText.trim(),
      },
    ]);
    setNewCommentText('');
  };

  // Feature 03: Database Isolation Inspector State
  const [activeSchemaTab, setActiveSchemaTab] = useState<'workspaces' | 'memberships' | 'outbox'>(
    'workspaces',
  );
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryExecutionTime, setQueryExecutionTime] = useState('0.38ms');

  const triggerQuerySimulation = () => {
    setQueryRunning(true);
    setTimeout(() => {
      setQueryRunning(false);
      setQueryExecutionTime(`${(Math.random() * 0.3 + 0.25).toFixed(2)}ms`);
    }, 450);
  };

  const currentItems = sprintItems[selectedCycle] ?? [];
  const completedPoints = currentItems
    .filter((i) => i.status === 'DONE')
    .reduce((acc, curr) => acc + curr.points, 0);
  const totalPoints = currentItems.reduce((acc, curr) => acc + curr.points, 0);
  const completionPercentage =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <div className="bg-[#050507] text-zinc-100 py-32 space-y-48 overflow-hidden relative">
      {/* Background Subtle Coordinate Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ========================================================================= */}
      {/* SECTION 01: DYNAMIC PROJECT CYCLES & VELOCITY */}
      {/* ========================================================================= */}
      <section id="cycles" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Editorial Header with Giant Numeral */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/25 via-white/10 to-transparent select-none">
                01
              </span>
              <div className="border-l border-emerald-500/30 pl-4 py-1">
                <span className="block font-mono text-xs uppercase tracking-widest text-emerald-400">
                  Engineering Rhythm
                </span>
                <span className="block font-mono text-[11px] text-zinc-500 mt-0.5">
                  CYCLE-DRIVEN DELIVERY
                </span>
              </div>
            </div>

            <h2 className="mt-8 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Sprint velocity driven by provable math.
            </h2>
            <p className="mt-5 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md">
              No nebulous story-point inflation. Cycles calculate pure deterministic burndown from
              real commit shas, active PR states, and automated continuous verification gates.
            </p>

            {/* Quick Metrics Bar */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-y border-white/[0.08] py-5">
              <div>
                <span className="block font-mono text-2xl font-bold text-emerald-400">
                  {completionPercentage}%
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                  Burndown Target
                </span>
              </div>
              <div>
                <span className="block font-mono text-2xl font-bold text-white">
                  {completedPoints}/{totalPoints}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                  Completed Pts
                </span>
              </div>
              <div>
                <span className="block font-mono text-2xl font-bold text-indigo-400">0.0%</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-1">
                  Scope Drift
                </span>
              </div>
            </div>

            {/* Cycle Selector Scrubber */}
            <div className="mt-8 flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-400 mr-2">SELECT CYCLE:</span>
              {(['13', '14', '15'] as const).map((cycleNum) => (
                <button
                  key={cycleNum}
                  onClick={() => setSelectedCycle(cycleNum)}
                  className={`px-3 py-1.5 rounded font-mono text-xs transition-all ${
                    selectedCycle === cycleNum
                      ? 'bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/20'
                      : 'border border-white/10 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  Cycle #{cycleNum}
                </button>
              ))}
            </div>
          </div>

          {/* Right Technical Canvas: Interactive Sprint Board & Telemetry Chart */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#09090d] p-6 sm:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="text-white font-semibold">Active Cycle {selectedCycle}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-emerald-400">Deterministic Burndown Engine</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                <span>Updated 12s ago via GitHub webhook</span>
              </div>
            </div>

            {/* Live SVG Telemetry Wave Chart (Neon-Style) */}
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/40 p-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME VELOCITY TRAJECTORY
                </span>
                <span className="text-emerald-400">
                  {completionPercentage}% OF PLANNED WORK DELIVERED
                </span>
              </div>

              <div className="relative h-28 w-full">
                <svg
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 100"
                >
                  <defs>
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line
                    x1="0"
                    y1="25"
                    x2="500"
                    y2="25"
                    stroke="#ffffff"
                    strokeOpacity="0.05"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0"
                    y1="50"
                    x2="500"
                    y2="50"
                    stroke="#ffffff"
                    strokeOpacity="0.05"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="0"
                    y1="75"
                    x2="500"
                    y2="75"
                    stroke="#ffffff"
                    strokeOpacity="0.05"
                    strokeDasharray="4 4"
                  />

                  {/* Ideal Linear Guideline */}
                  <line
                    x1="0"
                    y1="10"
                    x2="500"
                    y2="90"
                    stroke="#71717a"
                    strokeOpacity="0.4"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Actual Velocity Curve */}
                  <path
                    d={
                      selectedCycle === '14'
                        ? 'M0,15 Q80,20 150,45 T300,70 T420,82 L500,88 L500,100 L0,100 Z'
                        : selectedCycle === '13'
                          ? 'M0,10 Q120,30 250,60 T400,90 T500,98 L500,100 L0,100 Z'
                          : 'M0,10 Q100,15 200,20 T350,25 T500,30 L500,100 L0,100 Z'
                    }
                    fill="url(#neonGradient)"
                  />
                  <path
                    d={
                      selectedCycle === '14'
                        ? 'M0,15 Q80,20 150,45 T300,70 T420,82 L500,88'
                        : selectedCycle === '13'
                          ? 'M0,10 Q120,30 250,60 T400,90 T500,98'
                          : 'M0,10 Q100,15 200,20 T350,25 T500,30'
                    }
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/[0.04]">
                <span>T-00:00 (SPRINT START)</span>
                <span>DAY 4 (MID-CYCLE)</span>
                <span>DAY 8 (FREEZE)</span>
                <span>DAY 10 (RELEASE)</span>
              </div>
            </div>

            {/* Interactive Sprint Item Checklist */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1 pb-1">
                <span>INTERACTIVE WORK ITEMS (CLICK TO CYCLE STATUS)</span>
                <span>ESTIMATION</span>
              </div>
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemStatus(selectedCycle, item.id)}
                  className="group flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-zinc-950/70 hover:border-emerald-500/40 hover:bg-zinc-900/60 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`h-4 w-4 rounded flex items-center justify-center transition ${
                        item.status === 'DONE'
                          ? 'bg-emerald-500 text-black'
                          : item.status === 'IN_PROGRESS'
                            ? 'border border-amber-400 text-amber-400'
                            : 'border border-zinc-700'
                      }`}
                    >
                      {item.status === 'DONE' && <CheckCircle2 className="h-3 w-3" />}
                      {item.status === 'IN_PROGRESS' && <Clock className="h-2.5 w-2.5" />}
                    </button>
                    <span className="font-mono text-xs font-semibold text-emerald-400/90">
                      {item.id}
                    </span>
                    <span
                      className={`text-xs ${item.status === 'DONE' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        item.status === 'DONE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-white/[0.05]">
                      {item.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02: CONTEXTUAL WORKSPACE THREADS */}
      {/* ========================================================================= */}
      <section id="threads" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Interactive Discussion Canvas */}
          <div className="lg:col-span-7 order-2 lg:order-1 rounded-2xl border border-white/[0.08] bg-[#09090d] p-6 sm:p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Ticket Anchor Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs">
                  ANCHORED TO #ZIA-25
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Workspace Tenant Boundary ADR-003
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live SSE Stream
              </span>
            </div>

            {/* Comments List */}
            <div className="mt-6 space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-mono text-[10px] text-indigo-200">
                        {comment.avatar}
                      </div>
                      <span className="font-bold text-white">{comment.author}</span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {comment.role}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500">{comment.timestamp}</span>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {comment.text}
                  </p>

                  {comment.codeSnippet && (
                    <div className="mt-3 rounded-lg border border-white/[0.06] bg-black/70 p-3 font-mono text-[11px] text-indigo-300 overflow-x-auto">
                      <code>{comment.codeSnippet}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddComment} className="mt-5 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Anchor a comment to this work item context..."
                className="flex-1 rounded-lg border border-white/[0.1] bg-black/60 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Send</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Right Side: Editorial Header with Giant Numeral */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/25 via-white/10 to-transparent select-none">
                02
              </span>
              <div className="border-l border-indigo-500/30 pl-4 py-1">
                <span className="block font-mono text-xs uppercase tracking-widest text-indigo-400">
                  Shared Cognition
                </span>
                <span className="block font-mono text-[11px] text-zinc-500 mt-0.5">
                  ANCHORED THREADS
                </span>
              </div>
            </div>

            <h2 className="mt-8 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Conversations anchored directly to code.
            </h2>
            <p className="mt-5 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md">
              Eliminate the cognitive whiplash between Slack channels and Jira boards. Every
              technical debate, PR link, and schema review lives in the direct context of the work
              unit.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mt-0.5">
                  <GitCommit className="h-3 w-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    Zero Slack Context Drift
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Conversations never expire into closed unsearchable DMs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-0.5">
                  <Sparkles className="h-3 w-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    Autonomous AI Agent Context
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Agents ingest thread histories natively without lossy RAG.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03: PROVABLE MULTI-TENANT BOUNDARY (POSTGRESQL 17 NATIVE) */}
      {/* ========================================================================= */}
      <section id="isolation" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Editorial Header with Giant Numeral */}
          <div className="lg:col-span-5">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/25 via-white/10 to-transparent select-none">
                03
              </span>
              <div className="border-l border-amber-500/30 pl-4 py-1">
                <span className="block font-mono text-xs uppercase tracking-widest text-amber-400">
                  Data Sovereignity
                </span>
                <span className="block font-mono text-[11px] text-zinc-500 mt-0.5">
                  POSTGRESQL 17 NATIVE
                </span>
              </div>
            </div>

            <h2 className="mt-8 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Provable multi-tenant boundary isolation.
            </h2>
            <p className="mt-5 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md">
              Every database query is scoped by{' '}
              <code className="text-amber-300 font-mono">workspace_id</code>. Single-use SHA-256
              tokens protect member onboarding. The transactional outbox pattern guarantees reliable
              state distribution without Kafka sprawl.
            </p>

            {/* Architecture Invariant Bullet Points */}
            <div className="mt-8 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg border border-white/[0.06] bg-zinc-950 flex items-center justify-between">
                <span className="text-zinc-400">ISOLATION PREDICATE</span>
                <span className="text-amber-400 font-bold">workspace_id = :current</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-zinc-950 flex items-center justify-between">
                <span className="text-zinc-400">INVITATION TOKENS</span>
                <span className="text-emerald-400 font-bold">SHA-256 Single-Use</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.06] bg-zinc-950 flex items-center justify-between">
                <span className="text-zinc-400">OUTBOX CONSUMER</span>
                <span className="text-indigo-400 font-bold">FOR UPDATE SKIP LOCKED</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive PostgreSQL 17 Table & Query Inspector */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#09090d] p-6 sm:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Schema Switcher Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-amber-400" />
                <span className="font-mono text-xs text-white font-semibold">
                  PostgreSQL 17 Native Inspector
                </span>
              </div>
              <div className="flex gap-1">
                {(['workspaces', 'memberships', 'outbox'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSchemaTab(tab)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] transition ${
                      activeSchemaTab === tab
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    schema.{tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Real PostgreSQL Table Representation (Supabase-Style) */}
            <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/60 overflow-hidden font-mono text-xs">
              <div className="grid grid-cols-12 bg-zinc-900/80 px-4 py-2 border-b border-white/[0.06] text-zinc-400 text-[11px]">
                <div className="col-span-4">COLUMN</div>
                <div className="col-span-4">TYPE</div>
                <div className="col-span-4 text-right">CONSTRAINTS</div>
              </div>

              {activeSchemaTab === 'workspaces' && (
                <div className="divide-y divide-white/[0.04]">
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">id</div>
                    <div className="col-span-4 text-zinc-500">uuid</div>
                    <div className="col-span-4 text-right text-emerald-400">PRIMARY KEY</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">slug</div>
                    <div className="col-span-4 text-zinc-500">varchar(63)</div>
                    <div className="col-span-4 text-right text-indigo-400">UNIQUE NOT NULL</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">status</div>
                    <div className="col-span-4 text-zinc-500">workspace_status</div>
                    <div className="col-span-4 text-right text-zinc-400">
                      DEFAULT &apos;ACTIVE&apos;
                    </div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">created_at</div>
                    <div className="col-span-4 text-zinc-500">timestamptz</div>
                    <div className="col-span-4 text-right text-zinc-400">NOW()</div>
                  </div>
                </div>
              )}

              {activeSchemaTab === 'memberships' && (
                <div className="divide-y divide-white/[0.04]">
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">workspace_id</div>
                    <div className="col-span-4 text-zinc-500">uuid</div>
                    <div className="col-span-4 text-right text-amber-400">FK workspaces(id)</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">account_id</div>
                    <div className="col-span-4 text-zinc-500">uuid</div>
                    <div className="col-span-4 text-right text-indigo-400">FK accounts(id)</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">role</div>
                    <div className="col-span-4 text-zinc-500">workspace_role</div>
                    <div className="col-span-4 text-right text-emerald-400">
                      OWNER | ADMIN | MEMBER
                    </div>
                  </div>
                </div>
              )}

              {activeSchemaTab === 'outbox' && (
                <div className="divide-y divide-white/[0.04]">
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">id</div>
                    <div className="col-span-4 text-zinc-500">uuid</div>
                    <div className="col-span-4 text-right text-emerald-400">PRIMARY KEY</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">event_name</div>
                    <div className="col-span-4 text-zinc-500">varchar(128)</div>
                    <div className="col-span-4 text-right text-zinc-400">NOT NULL</div>
                  </div>
                  <div className="grid grid-cols-12 px-4 py-2 text-zinc-300">
                    <div className="col-span-4 text-amber-300 font-bold">payload</div>
                    <div className="col-span-4 text-zinc-500">jsonb</div>
                    <div className="col-span-4 text-right text-indigo-400">
                      SERIALIZED DOMAIN EVENT
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Live Query Execution with Timing */}
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-zinc-950 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    EXPLAIN ANALYZE SELECT * FROM schema.{activeSchemaTab} WHERE workspace_id = $1
                  </span>
                </div>
                <button
                  onClick={triggerQuerySimulation}
                  disabled={queryRunning}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono text-[11px] transition flex items-center gap-1.5"
                >
                  {queryRunning ? 'Executing...' : 'Run Query'}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px] border-t border-white/[0.06] pt-3 text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  Index Scan using idx_workspaces_tenant_scope
                </span>
                <span className="text-emerald-400 font-bold">
                  Execution Time: {queryExecutionTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
