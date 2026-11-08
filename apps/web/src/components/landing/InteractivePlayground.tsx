import { useState } from 'react';
import { Layers, MessageSquare, Building, Send, ShieldCheck, Sparkles } from 'lucide-react';

interface MockItem {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignee: string;
}

export function InteractivePlayground() {
  const [activeTab, setActiveTab] = useState<'sprint' | 'discussion' | 'tenant'>('sprint');

  // Interactive Sprint state
  const [items, setItems] = useState<MockItem[]>([
    {
      id: 'KIV-101',
      title: 'Implement transactional outbox poller',
      status: 'DONE',
      assignee: 'ZA',
    },
    {
      id: 'KIV-102',
      title: 'Argon2id credential hash upgrade',
      status: 'IN_PROGRESS',
      assignee: 'EL',
    },
    { id: 'KIV-103', title: 'Tenant context authorization guard', status: 'TODO', assignee: 'MK' },
  ]);

  // Interactive Discussion state
  const [comments, setComments] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Ziad Ayman',
      text: 'Verified that the PostgreSQL 17 test harness cleans tables between runs.',
      time: '10:42 AM',
    },
    {
      sender: 'Sarah Chen',
      text: 'Awesome, boundary cruise also passed with zero cross-module leaks.',
      time: '10:44 AM',
    },
  ]);
  const [newComment, setNewComment] = useState('');

  // Interactive Tenant switcher state
  const [activeTenant, setActiveTenant] = useState<'acme-core' | 'globex-rnd'>('acme-core');

  const cycleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus =
          item.status === 'TODO' ? 'IN_PROGRESS' : item.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        return { ...item, status: nextStatus };
      }),
    );
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      { sender: 'You (Guest)', text: newComment.trim(), time: 'Just now' },
    ]);
    setNewComment('');
  };

  return (
    <section id="demo" className="py-24 bg-zinc-950 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Interactive Sandbox</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Test-Drive the Operating System.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            Click to interact below. Experience the speed, clean data models, and zero-latency feel
            of KIVO directly in your browser.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-white/[0.08] bg-zinc-900/60 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab('sprint')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'sprint'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>1. Live Sprint Board</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discussion')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'discussion'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>2. Contextual Thread</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tenant')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'tenant'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building className="h-4 w-4" />
              <span>3. Tenant Context Switcher</span>
            </button>
          </div>
        </div>

        {/* Sandbox Display Box */}
        <div className="mt-8 mx-auto max-w-4xl rounded-2xl border border-white/[0.1] bg-[#0c0d12] p-6 shadow-2xl">
          {activeTab === 'sprint' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Interactive Cycle Board</h3>
                  <p className="text-xs text-zinc-400">
                    Click any card below to cycle its status live!
                  </p>
                </div>
                <span className="font-mono text-xs text-emerald-400">
                  {items.filter((i) => i.status === 'DONE').length}/{items.length} Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => cycleStatus(item.id)}
                    className="text-left rounded-xl border border-white/[0.08] bg-zinc-900/50 p-4 transition hover:border-indigo-500/50 hover:bg-zinc-900 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-zinc-400">{item.id}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          item.status === 'DONE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'IN_PROGRESS'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-white line-clamp-2">{item.title}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Click to cycle →</span>
                      <span className="h-5 w-5 rounded-full bg-indigo-600/40 text-indigo-300 flex items-center justify-center font-bold">
                        {item.assignee}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Anchored Thread: Ticket #KIV-101</h3>
                  <p className="text-xs text-zinc-400">
                    Contextual discussion bound to code & issue
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                {comments.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/[0.04] bg-zinc-900/40 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-300">{c.sender}</span>
                      <span className="text-[10px] text-zinc-500">{c.time}</span>
                    </div>
                    <p className="mt-1 text-zinc-300">{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Type a message into the thread..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tenant' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Zero-Latency Tenant Switcher</h3>
                  <p className="text-xs text-zinc-400">
                    Switch workspace context without full page reload
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Isolation Guaranteed</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTenant('acme-core')}
                  className={`rounded-xl border p-4 text-left transition ${
                    activeTenant === 'acme-core'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-mono text-xs text-indigo-400">/acme-core</span>
                  <h4 className="mt-1 text-sm font-bold text-white">Acme Engineering Core</h4>
                  <p className="mt-1 text-[11px] text-zinc-400">12 Active Members • Role: OWNER</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTenant('globex-rnd')}
                  className={`rounded-xl border p-4 text-left transition ${
                    activeTenant === 'globex-rnd'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-mono text-xs text-indigo-400">/globex-rnd</span>
                  <h4 className="mt-1 text-sm font-bold text-white">Globex R&D Labs</h4>
                  <p className="mt-1 text-[11px] text-zinc-400">4 Active Members • Role: ADMIN</p>
                </button>
              </div>

              <div className="rounded-lg border border-white/[0.04] bg-zinc-950 p-3 font-mono text-[11px] text-zinc-400">
                <div className="text-zinc-500">// Resolved Database Tenant Context:</div>
                <div className="text-emerald-400 mt-1">
                  SET LOCAL app.current_workspace_id = '
                  {activeTenant === 'acme-core' ? 'ws_01acme982' : 'ws_02globex451'}';
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
