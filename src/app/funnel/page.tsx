'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, PageHeader, StatTile, TextInput } from '@/components/ui';

type FunnelRow = {
  keyword: 'HABITS' | 'BLUEPRINT' | 'PLANNER' | 'RAMADAN';
  trigger_count: number;
  clicks: number;
  purchases: number;
  updated_at: string;
};

function pct(purchases: number, clicks: number) {
  if (!clicks) return 0;
  return Math.round((purchases / clicks) * 1000) / 10;
}

export default function FunnelPage() {
  const [rows, setRows] = useState<FunnelRow[]>([]);
  const [draft, setDraft] = useState<Record<string, { trigger_count: string; clicks: string; purchases: string }>>({});

  useEffect(() => {
    let cancelled = false;
    fetch('/api/funnel')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setRows(data.rows);
        const d: Record<FunnelRow['keyword'], { trigger_count: string; clicks: string; purchases: string }> = {
          HABITS: { trigger_count: '0', clicks: '0', purchases: '0' },
          BLUEPRINT: { trigger_count: '0', clicks: '0', purchases: '0' },
          PLANNER: { trigger_count: '0', clicks: '0', purchases: '0' },
          RAMADAN: { trigger_count: '0', clicks: '0', purchases: '0' },
        };
        data.rows.forEach((r: FunnelRow) => {
          d[r.keyword] = {
            trigger_count: String(r.trigger_count),
            clicks: String(r.clicks),
            purchases: String(r.purchases),
          };
        });
        setDraft(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          acc.trigger += r.trigger_count;
          acc.clicks += r.clicks;
          acc.purchases += r.purchases;
          return acc;
        },
        { trigger: 0, clicks: 0, purchases: 0 }
      ),
    [rows]
  );

  async function saveRow(keyword: FunnelRow['keyword']) {
    const d = draft[keyword];
    if (!d) return;
    const body = {
      keyword,
      trigger_count: Math.max(0, Number(d.trigger_count || 0)),
      clicks: Math.max(0, Number(d.clicks || 0)),
      purchases: Math.max(0, Number(d.purchases || 0)),
    };
    const res = await fetch('/api/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    setRows(res.rows);
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Offers"
        title="A gentler read of conversion across the offer stack"
        description="Offer performance is framed as health now: where conversations open, where curiosity deepens, and where purchases actually happen."
        right={
          <div className="soft-well rounded-[28px] border border-[var(--border)] px-5 py-4 text-sm">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Overall conversion</div>
            <div className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{pct(totals.purchases, totals.clicks)}%</div>
          </div>
        }
      />

      <section className="stat-strip grid gap-5 py-5 sm:grid-cols-3">
        <StatTile label="Triggers" value={totals.trigger} hint="Times a keyword or entry point was activated." accent="plum" />
        <StatTile label="Clicks" value={totals.clicks} hint="People moving from interest into curiosity." accent="peach" />
        <StatTile label="Purchases" value={totals.purchases} hint="Clear next steps that became sales." accent="sage" />
      </section>

      <Card title="Offer health by keyword" subtitle="Manual inputs stay, but the presentation is cleaner and less spreadsheet-coded.">
        <div className="space-y-8">
          {rows.map((r, index) => {
            const d = draft[r.keyword];
            const conversion = pct(Number(d?.purchases ?? r.purchases), Number(d?.clicks ?? r.clicks));
            return (
              <section key={r.keyword} className="grid gap-6 border-t border-[var(--line)] pt-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">0{index + 1} · offer keyword</div>
                  <div className="mt-3 font-serif-ui text-[2.6rem] leading-none text-[var(--foreground)]">{r.keyword}</div>
                  <div className="mt-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-[var(--foreground)]">
                    {conversion}% conversion
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Triggers</div>
                      <TextInput type="number" value={d?.trigger_count ?? String(r.trigger_count)} onChange={(v) => setDraft((prev) => ({ ...prev, [r.keyword]: { ...prev[r.keyword], trigger_count: v } }))} />
                    </div>
                    <div>
                      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Clicks</div>
                      <TextInput type="number" value={d?.clicks ?? String(r.clicks)} onChange={(v) => setDraft((prev) => ({ ...prev, [r.keyword]: { ...prev[r.keyword], clicks: v } }))} />
                    </div>
                    <div>
                      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Purchases</div>
                      <TextInput type="number" value={d?.purchases ?? String(r.purchases)} onChange={(v) => setDraft((prev) => ({ ...prev, [r.keyword]: { ...prev[r.keyword], purchases: v } }))} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--muted)]">
                    <span>Updated {new Date(r.updated_at).toLocaleString()}</span>
                    <Button variant="outline" onClick={() => saveRow(r.keyword)}>Save changes</Button>
                  </div>
                </div>
              </section>
            );
          })}

          {!rows.length && <div className="text-sm text-[var(--muted)]">No offer data yet.</div>}
        </div>
      </Card>
    </div>
  );
}
