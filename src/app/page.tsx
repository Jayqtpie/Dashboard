'use client';

import Link from 'next/link';
import { Card, PageHeader, StatTile } from '@/components/ui';

const rhythm = [
  {
    title: 'Begin with today',
    body: 'Choose a CTA, move through your checklist, and protect one focused engagement block after publishing.',
    href: '/today',
    cta: 'Open today',
  },
  {
    title: 'Review what is growing',
    body: 'Keep your metrics, winning hooks, CTAs, and learning notes in one weekly review space.',
    href: '/growth',
    cta: 'Open growth',
  },
  {
    title: 'Keep offers clear',
    body: 'Track keyword triggers, clicks, and purchases without turning your workspace into a spreadsheet maze.',
    href: '/funnel',
    cta: 'Open offers',
  },
  {
    title: 'Care for the back end',
    body: 'Monitor automations, delivery issues, and alerts so the business stays dependable and peaceful.',
    href: '/ops-health',
    cta: 'Open care',
  },
];

export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        eyebrow="Home"
        title="A calmer workspace for meaningful business building"
        description="GuidedBarakah is now framed as a home base rather than a command center: simpler pathways, softer language, and a clearer mental model for Muslim creators and entrepreneurs."
        right={
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:min-w-[260px]">
            <div className="eyebrow">This space is for</div>
            <div className="mt-2 font-serif-ui text-2xl text-[var(--foreground)]">Clarity before velocity</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Build steadily, notice what matters, and let the interface breathe.</p>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Daily rhythm" value="One clear next step" hint="Open Today to choose your focus and begin well." accent="teal" />
        <StatTile label="Weekly learning" value="Metrics + copy + notes" hint="Growth is now organized around signal first, then decisions." accent="gold" />
        <StatTile label="Offer health" value="Keywords to purchases" hint="A cleaner view of performance across your offers." accent="cream" />
        <StatTile label="Business care" value="Calm operations" hint="Reliability, alerts, and gentle maintenance in one place." accent="teal" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card title="How the workspace is organized" subtitle="Four spaces, one simple mental model.">
          <div className="grid gap-4 md:grid-cols-2">
            {rhythm.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
                <div className="font-serif-ui text-2xl text-[var(--foreground)]">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                <div className="mt-4 text-sm font-semibold text-[var(--gb-teal)]">{item.cta} →</div>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="Design direction" subtitle="What changed in this phase-2 pass.">
          <div className="space-y-3 text-sm leading-6 text-[var(--muted)]">
            <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">A real home page replaces the old redirect, so the product starts with orientation instead of instant task pressure.</div>
            <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">Navigation uses softer names and supportive descriptions to reduce the command-center feeling.</div>
            <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">The visual language leans editorial and premium: serif headlines, cream surfaces, teal anchors, and subtle geometry.</div>
          </div>
        </Card>
      </div>

      <Card title="A simple rhythm for the week" subtitle="Use the product in a calmer sequence.">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            ['1', 'Begin your day', 'Open Today, finish your posting workflow, and protect one engagement window.'],
            ['2', 'Notice signal', 'Review Growth to see what content and ideas deserve more attention.'],
            ['3', 'Refine offers', 'Open Offers to update keyword, click, and purchase movement.'],
            ['4', 'Tend the business', 'Use Care to keep automations and delivery dependable.'],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-[28px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,white_6%)] p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--chip-bg)] text-sm font-semibold text-[var(--foreground)]">{step}</div>
              <div className="mt-4 font-serif-ui text-2xl text-[var(--foreground)]">{title}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
