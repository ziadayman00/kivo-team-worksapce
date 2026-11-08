import { useState } from 'react';
import { Calculator, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RoiCalculator() {
  const [teamSize, setTeamSize] = useState<number>(20);
  const [avgSalary, setAvgSalary] = useState<number>(140000);

  // Math:
  // An average developer spends ~5 hours/week switching between Slack, Jira, Notion, and Docs.
  // With KIVO unified OS, context switching is cut by ~70% (3.5 hours saved/developer/week).
  // Hourly rate = avgSalary / (52 * 40)
  const hourlyRate = avgSalary / 2080;
  const hoursSavedPerYear = teamSize * 3.5 * 48; // 48 working weeks
  const annualEngineeringSavings = Math.round(hoursSavedPerYear * hourlyRate);

  // SaaS subscription savings:
  // Fragmented stack = ~$92/user/mo
  // KIVO = $10/user/mo
  // Difference = $82/user/mo * 12 mo
  const saasSavings = teamSize * 82 * 12;
  const totalAnnualValue = annualEngineeringSavings + saasSavings;

  return (
    <section className="py-28 bg-[#060609] border-t border-white/[0.08] relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-400 mb-4">
            <Calculator className="h-3.5 w-3.5" />
            <span>INTERACTIVE VELOCITY ECONOMICS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Calculate Your Team&apos;s Reclaimed Velocity.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            See the exact annual capital and engineering hours your squad reclaims by consolidating
            onto KIVO.
          </p>
        </div>

        {/* Calculator Widget Box */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-white/[0.1] bg-[#0c0d13] p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left Controls */}
            <div className="space-y-8 font-mono">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                  <span className="font-bold text-white">ENGINEERING TEAM SIZE</span>
                  <span className="text-emerald-400 font-bold text-sm">{teamSize} Engineers</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>5 devs</span>
                  <span>50 devs</span>
                  <span>100 devs</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-300 mb-2">
                  <span className="font-bold text-white">AVG. BASE SALARY</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${avgSalary.toLocaleString()} / year
                  </span>
                </div>
                <input
                  type="range"
                  min="80000"
                  max="250000"
                  step="10000"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>$80k</span>
                  <span>$160k</span>
                  <span>$250k</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-zinc-950 p-4 text-[11px] text-zinc-400 leading-relaxed font-sans">
                <strong>Empirical Model:</strong> Based on research showing engineering teams lose
                ~5.2 hours per week to tool fragmentation, Slack search lag, and manual ticket
                status synchronization.
              </div>
            </div>

            {/* Right Output Dashboard */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 font-mono text-center flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block">
                  ANNUAL PRODUCTIVITY VALUE RECLAIMED
                </span>

                <div className="mt-4 text-4xl sm:text-5xl font-black text-white tracking-tight">
                  ${totalAnnualValue.toLocaleString()}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-left border-y border-white/[0.08] py-4">
                  <div>
                    <span className="block text-[10px] text-zinc-400">ENGINEERING HOURS SAVED</span>
                    <span className="block text-base font-bold text-emerald-300 mt-0.5">
                      {Math.round(hoursSavedPerYear).toLocaleString()} hrs/yr
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-400">
                      TOOL SUBSCRIPTION SAVINGS
                    </span>
                    <span className="block text-base font-bold text-emerald-300 mt-0.5">
                      ${saasSavings.toLocaleString()} /yr
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Start Reclaiming Velocity Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
