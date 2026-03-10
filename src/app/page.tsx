'use client';

import Link from 'next/link';
import { PageHeader, StatTile } from '@/components/ui';

const priorities = [
  {
    title: 'Run today with intent',
    body: 'Choose the invitation, complete the non-negotiables, and protect the first engagement window while the post still has heat.',
    href: '/today',
    cta: 'Open today ops',
    metric: '01',
  },
  {
    title: 'Read live signal fast',
    body: 'Check metrics, saved hooks, and decision notes in one pass so the next move comes from evidence instead of vibes.',
    href: '/growth',
    cta: 'Review signal',
    metric: '02',
  },
  {
    title: 'Tighten offer conversion',
    body: 'Keep trigger, click, and purchase performance in view without turning the business into a bloated spreadsheet ritual.',
    href: '/funnel',
    cta: 'Inspect offers',
    metric: '03',
  },
  {
    title: 'Catch ops before drift',
    body: 'Track failures, automation reliability, and cleanup work before backstage problems reach the customer-facing story.',
    href: '/ops-health',
    cta: 'Check ops',
    metric: '04',
  },
];

const briefs = [
  ['North star', 'Build trust, not content velocity theatre.'],
  ['Weekly cadence', 'Publish, engage, read signal, tighten offers, clean operations.'],
  ['Risk to watch', 'Noise disguised as busyness. Pretty dashboards are part of the problem.'],
  ['Decision rule', 'If it does not move clarity, conversion, or reliability, it waits.'],
];

const rhythms = [
  ['Monday', 'Set the message, pick the offer, define what winning looks like this week.'],
  ['Tuesday to Thursday', 'Ship content, protect response windows, and capture language worth reusing.'],
  ['Friday', 'Review conversion and ops debt. Clear the weak points before the next cycle.'],
];

export default function Home() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Overview"
        title="Run GuidedBarakah from one clear operating surface"
        description="A founder overview for priorities, live signal, execution rhythm, and the queues that actually move the business. Flat architecture. Hard dividers. No decorative layers."
        right={
          <div className="space-y-3 text-sm leading-6 text-[var(--muted)]">
            <div className="eyebrow">Current stance</div>
            <div className="border-t border-[var(--line)] pt-3 text-[1.6rem] font-semibold leading-tight text-[var(--foreground)]">Clarity before scale.</div>
            <p>Use the workspace to make decisions quickly, keep momentum visible, and stop hiding real priorities inside decorative UI shells.</p>
          </div>
        }
      />

      <section className="stat-strip grid gap-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Operating posture" value="Founder-led" hint="One source of truth for execution, signal, and cleanup." accent="plum" />
        <StatTile label="Primary focus" value="Ship + learn" hint="Publish, engage, and review evidence while it is still fresh." accent="peach" />
        <StatTile label="Offer pressure" value="Conversion" hint="Interest is useless if the path to purchase leaks." accent="sage" />
        <StatTile label="System standard" value="No drift" hint="Ops problems should be seen early and resolved without drama." accent="plum" />
      </section>

      <section className="command-band">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div>
            <div className="mb-5 border-b border-[var(--line)] pb-5">
              <div className="eyebrow">Priority lanes</div>
              <h2 className="mt-3 text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--foreground)] sm:text-[1.95rem]">The four lanes that run the week</h2>
            </div>
            <div>
              {priorities.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group grid gap-4 border-b border-[var(--line)] py-5 transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)] sm:grid-cols-[70px_minmax(0,1fr)_auto] sm:items-start sm:px-3"
                >
                  <div className="text-[1.2rem] font-semibold leading-none tracking-[-0.02em] text-[var(--muted)] sm:text-[1.4rem]">{item.metric}</div>
                  <div>
                    <div className="text-base font-semibold leading-tight tracking-[-0.01em] text-[var(--foreground)] sm:text-[1.1rem]">{item.title}</div>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">{item.body}</p>
                  </div>
                  <div className="ui-label sm:pt-1">{item.cta}</div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="border-t border-[var(--line)] pt-5 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            <div className="eyebrow">Command brief</div>
            <div className="mt-3 space-y-3">
              {briefs.map(([label, body]) => (
                <div key={label} className="border-b border-[var(--line)] pb-4">
                  <div className="ui-label">{label}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">{body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="command-band">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="border-b border-[var(--line)] pb-5">
              <div className="eyebrow">System shift</div>
              <h2 className="mt-3 text-[1.45rem] font-semibold leading-[1.04] tracking-[-0.02em] text-[var(--foreground)] sm:text-[1.8rem]">What changed in the redesign</h2>
            </div>
            <div className="mt-4 space-y-0">
              {[
                'The old dashboard shell is gone. The homepage now behaves like an operating document with full-width structure and visible hierarchy.',
                'Priority navigation, metrics, and command context now live in rows and rails rather than cards stacked inside cards.',
                'Typography now stays in one calmer system: measured headlines, compact labels, and inline evidence instead of decorative treatment.',
              ].map((text, index) => (
                <div key={text} className="grid gap-3 border-b border-[var(--line)] py-4 sm:grid-cols-[40px_minmax(0,1fr)]">
                  <div className="ui-label">0{index + 1}</div>
                  <p className="text-sm leading-7 text-[var(--muted-strong)]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="border-b border-[var(--line)] pb-5">
              <div className="eyebrow">Weekly rhythm</div>
              <h2 className="mt-3 text-[1.45rem] font-semibold leading-[1.04] tracking-[-0.02em] text-[var(--foreground)] sm:text-[1.8rem]">How to use the workspace</h2>
            </div>
            <div className="mt-4 space-y-0">
              {rhythms.map(([label, body]) => (
                <div key={label} className="grid gap-3 border-b border-[var(--line)] py-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <div className="ui-label">{label}</div>
                  <p className="text-sm leading-7 text-[var(--muted-strong)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
