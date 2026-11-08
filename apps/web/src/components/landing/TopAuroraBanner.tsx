import { Radio, ShieldCheck, Terminal } from 'lucide-react';

export function TopAuroraBanner() {
  return (
    <div className="relative border-b border-white/[0.08] bg-[#030305] overflow-hidden text-[11px] font-mono select-none">
      {/* Aurora light bar with scanline glitch effect (Neon-inspired) */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="h-full w-full bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-indigo-500/30 blur-md" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8 text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Radio className="h-3 w-3 animate-pulse" />
            LIVE TELEMETRY
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline text-zinc-300">
            Node.js 24 LTS &bull; PostgreSQL 17 Native Active
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="font-semibold text-emerald-400">38/38</span>
            <span>DB Isolation Checks Pass</span>
          </div>

          <a
            href="https://github.com/ziadayman00/kivo-team-worksapce"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1 rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-zinc-300 hover:text-white hover:bg-white/[0.1] transition"
          >
            <Terminal className="h-2.5 w-2.5 text-cyan-400" />
            <span>git://kivo-team-workspace</span>
          </a>
        </div>
      </div>
    </div>
  );
}
