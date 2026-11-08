import { Terminal, Shield, Cpu, Activity } from 'lucide-react';

export function TelemetryTicker() {
  return (
    <section className="relative py-20 bg-[#040406] border-y border-white/[0.08] overflow-hidden">
      {/* Emerald Dot Matrix Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Radiant Glow in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-emerald-500/20 pb-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
                SYSTEM TELEMETRY & VERIFICATION
              </span>
              <span className="block font-mono text-[11px] text-zinc-500">
                CONTINUOUS RUNTIME VALIDATION
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              STATUS: NOMINAL
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">PostgreSQL 17 Native • Port 5432</span>
          </div>
        </div>

        {/* Matrix Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Metric 1 */}
          <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-sm group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
              <span>BOUNDARY AUDIT</span>
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-3 font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-emerald-300 transition">
              100%
            </div>
            <div className="mt-2 font-mono text-xs text-zinc-400">
              Zero cross-module internals leaks detected by dependency-cruiser.
            </div>
          </div>

          {/* Metric 2 */}
          <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-sm group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
              <span>CROSS-TENANT LEAKAGE</span>
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-3 font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-emerald-400">
              0.00<span className="text-2xl text-emerald-600">ms</span>
            </div>
            <div className="mt-2 font-mono text-xs text-zinc-400">
              Mathematically guaranteed workspace isolation at database level.
            </div>
          </div>

          {/* Metric 3 */}
          <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-sm group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
              <span>TEST INTEGRITY</span>
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="mt-3 font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-emerald-300 transition">
              38/38
            </div>
            <div className="mt-2 font-mono text-xs text-zinc-400">
              Native PostgreSQL integration tests passing with zero mock substitutes.
            </div>
          </div>

          {/* Metric 4 */}
          <div className="relative rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-sm group hover:border-emerald-500/40 transition">
            <div className="flex items-center justify-between text-zinc-500 font-mono text-[10px]">
              <span>IPC CALL OVERHEAD</span>
              <span className="text-emerald-400 font-mono font-bold">DIRECT</span>
            </div>
            <div className="mt-3 font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white group-hover:text-emerald-300 transition">
              &lt; 0.2<span className="text-2xl text-zinc-500">ms</span>
            </div>
            <div className="mt-2 font-mono text-xs text-zinc-400">
              Direct in-memory method dispatch between modular domain boundaries.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
