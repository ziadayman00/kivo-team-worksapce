import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: 'Developer / Open Source',
      description: 'Ideal for independent developers and open-source project squads.',
      price: '$0',
      period: 'free forever',
      badge: 'Community',
      features: [
        'Unlimited active workspaces',
        'Standard sprint cycles & backlog',
        'Contextual item discussions',
        'Single-use invitation links',
        'Self-hostable via local PostgreSQL',
        'Community Discord support',
      ],
      cta: 'Start Free',
      ctaLink: '/register',
      highlight: false,
    },
    {
      name: 'Team Velocity',
      description: 'Built for high-output engineering teams scaling their product velocity.',
      price: annual ? '$10' : '$12',
      period: 'per user / month',
      badge: 'Most Popular',
      features: [
        'Everything in Developer',
        'Unlimited real-time SSE outbox streams',
        'Custom workspace roles (Owner, Admin, Member)',
        '30-day activity audit trail retention',
        'Priority issue triage and cycle analytics',
        'Direct email and live chat support',
      ],
      cta: 'Start 14-Day Free Trial',
      ctaLink: '/register',
      highlight: true,
    },
    {
      name: 'Enterprise Organization',
      description: 'For organizations demanding custom isolation, compliance, and dedicated SLA.',
      price: 'Custom',
      period: 'billed annually',
      badge: 'Dedicated Scale',
      features: [
        'Everything in Team',
        'Dedicated PostgreSQL database cluster',
        'Enterprise SAML / Okta SSO integration',
        'Unlimited audit event history retention',
        'Custom domain & branding',
        '99.99% uptime SLA & dedicated engineer',
      ],
      cta: 'Contact Engineering',
      ctaLink: '/register',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-zinc-950 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
            TIERED RESOURCE ALLOCATION
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Predictable Engineering Economics.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400">
            No seat traps. No compute overages. Transparent infrastructure pricing for modern teams.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 flex items-center justify-center gap-3 text-xs font-mono">
            <span className={annual ? 'text-zinc-400' : 'font-semibold text-white'}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-emerald-400 transition ${
                  annual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={annual ? 'font-semibold text-white' : 'text-zinc-400'}>
              Annual <span className="text-emerald-400 text-[10px] font-mono">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-8 flex flex-col justify-between relative transition hover:border-white/[0.2] ${
                tier.highlight
                  ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 via-zinc-900/60 to-zinc-950 shadow-xl shadow-emerald-500/10'
                  : 'border-white/[0.08] bg-zinc-900/40'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-emerald-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
                  {tier.badge}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white font-mono">{tier.name}</h3>
                <p className="mt-2 text-xs text-zinc-400">{tier.description}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white font-mono">{tier.price}</span>
                  <span className="text-xs text-zinc-400 font-mono">{tier.period}</span>
                </div>

                <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-3 font-mono">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06]">
                <Link
                  to={tier.ctaLink}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold font-mono shadow-md transition ${
                    tier.highlight
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
