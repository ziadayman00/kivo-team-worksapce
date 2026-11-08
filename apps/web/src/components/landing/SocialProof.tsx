import { Shield, Zap, Server, Code2, Database, Terminal } from 'lucide-react';

export function SocialProof() {
  const specs = [
    { label: 'PostgreSQL 17 Native', desc: 'Strict Tenant RLS', icon: Database },
    { label: 'Node.js 24 LTS', desc: 'Active LTS Runtime', icon: Server },
    { label: 'Modular Monolith', desc: 'dependency-cruiser Gated', icon: Shield },
    { label: 'React 19 Concurrent', desc: 'Vite 6 + Tailwind v4', icon: Zap },
    { label: 'Transactional Outbox', desc: 'FOR UPDATE SKIP LOCKED', icon: Terminal },
    { label: 'Strict TypeScript', desc: '0 any, 100% Typed', icon: Code2 },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-zinc-950/80 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Built on production-grade architectural standards
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 text-center transition hover:border-white/[0.12] hover:bg-white/[0.03]"
              >
                <Icon className="h-5 w-5 text-zinc-400 mb-2" />
                <span className="text-xs font-bold text-zinc-200">{item.label}</span>
                <span className="mt-0.5 text-[10px] font-mono text-zinc-400">{item.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
