'use client';

import Link from 'next/link';
import { Card, PageHeader, StatTile } from '@/components/ui';

const rhythm = [
  {
    title: 'Begin with today',
    body: 'Choose the invitation, complete the essentials, and protect one engagement window while the post is still alive.',
    href: '/today',
    cta: 'Enter today',
  },
  {
    title: 'Read the signal',
    body: 'Look at metrics, saved hooks, and review notes in one narrative instead of separate dashboard panels.',
    href: '/growth',
    cta: 'Read signal',
  },
  {
    title: 'Refine the offers',
    body: 'Keep conversion visible without flattening your product thinking into a rigid spreadsheet aesthetic.',
    href: '/funnel',
    cta: 'Inspect offers',
  },
  {
    title: 'Care for operations',
    body: 'Watch delivery and automations with enough clarity to act early, not enough clutter to feel haunted.',
    href: '/ops-health',
    cta: 'Tend care',
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="World"
        title="A lighter, stranger home for meaningful business building"
        description="GuidedBarakah now behaves like a brand environment. It uses open composition, stronger typography, and fewer containers so the product feels premium, clear, and emotionally quieter."
        right={
          <div className="soft-well rounded-[30px] border border-[var(--border)] p-5">
            <div className="eyebrow">Atmosphere</div>
            <div className="mt-3 font-serif-ui text-3xl leading-tight text-[var(--foreground)]">Clarity before velocity.</div>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">The interface should feel composed enough to trust and bold enough to remember.</p>
          </div>
        }
      />

      <section className="stat-strip grid gap-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Daily rhythm" value="One deliberate next step" hint="Open Today and move with intention, not sprawl." accent="plum" />
        <StatTile label="Signal review" value="Metrics plus editorial judgment" hint="Growth is framed as reading signal, then deciding." accent="peach" />
        <StatTile label="Offer health" value="Interest into purchase" hint="Conversion is visible without turning the page into a table prison." accent="sage" />
        <StatTile label="Backstage care" value="Quiet operations" hint="Reliability belongs in the product, not in your nervous system." accent="plum" />
      </section>

      <Card title="Move through the workspace like a weekly ritual" subtitle="Four spaces, one cleaner mental model.">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
          {rhythm.map((item, index) => (
            <Link key={item.href} href={item.href} className="group border-t border-[var(--line)] pt-5 transition hover:translate-y-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/60">
              <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">0{index + 1}</div>
              <div className="mt-3 font-serif-ui text-[2rem] leading-[1.02] text-[var(--foreground)] sm:text-[2.3rem]">{item.title}</div>
              <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">{item.body}</p>
              <div className="mt-5 text-sm font-semibold tracking-[0.02em] text-[var(--gb-berry)] group-hover:text-[var(--foreground)]">{item.cta} →</div>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <Card title="What changed in this rework" subtitle="The dashboard skin got retired. Good riddance.">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              'The old cream-and-teal card stack is replaced by a plum, apricot, and sand palette with more emotional range.',
              'Sections now breathe with editorial spacing and line-based structure instead of endless rounded boxes inside rounded boxes.',
              'The shell, stats, and content flows are tuned to feel like one premium product story rather than a pile of utilities.',
            ].map((text) => (
              <p key={text} className="border-t border-[var(--line)] pt-4 text-sm leading-7 text-[var(--muted-strong)]">
                {text}
              </p>
            ))}
          </div>
        </Card>

        <Card title="Use rhythm" subtitle="A simple cadence for the week.">
          <div className="space-y-5">
            {[
              ['Monday', 'Choose what gets amplified.'],
              ['Midweek', 'Read signal and collect language worth keeping.'],
              ['Before offers', 'Tighten conversion friction and update the story.'],
              ['Friday', 'Clean up operations so next week begins lighter.'],
            ].map(([label, body]) => (
              <div key={label} className="border-t border-[var(--line)] pt-4">
                <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">{label}</div>
                <div className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">{body}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
