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

  const totals = useMemo(() => rows.reduce((acc, r) => {
    acc.trigger += r.trigger_count;
    acc.clicks += r.clicks;
    acc.purchases += r.purchases;
    return acc;
  }, { trigger: 0, clicks: 0, purchases: 0 }), [rows]);

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
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        eyebrow="Offers"
        title="A gentler view of conversion across your offers"
        description="Instead of a hard-edged funnel table, this page now frames performance as offer health: which keywords are opening conversations, creating clicks, and leading to purchases."
        right={<div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm"><div className="text-xs text-[var(--muted)]">Overall conversion</div><div className="mt-1 text-xl font-semibold text-[var(--gb-gold)]">{pct(totals.purchases, totals.clicks)}%</div></div>}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Triggers" value={totals.trigger} hint="Times a keyword or entry point was activated." accent="teal" />
        <StatTile label="Clicks" value={totals.clicks} hint="People who moved from interest to curiosity." accent="gold" />
        <StatTile label="Purchases" value={totals.purchases} hint="Clear next steps that became sales." accent="cream" />
      </section>

      <Card title="Offer health by keyword" subtitle="Update each row manually and keep the picture clear. Less noise, more meaning.">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((r) => {
              const d = draft[r.keyword];
              const conversion = pct(Number(d?.purchases ?? r.purchases), Number(d?.clicks ?? r.clicks));
              return (
                <section key={r.keyword} className="rounded-[30px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,white_6%)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="eyebrow">Offer keyword</div>
                      <div className="mt-2 font-serif-ui text-3xl text-[var(--foreground)]">{r.keyword}</div>
                    </div>
                    <div className="rounded-full bg-[var(--chip-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]">{conversion}% conversion</div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="mb-2 text-xs text-[var(--muted)]">Triggers</div>
                      <TextInput type="number" value={d?.trigger_count ?? String(r.trigger_count)} onChange={(v) => setDraft((prev) => ({ ...prev, [r.keyword]: { ...prev[r.keyword], trigger_count: v } }))} />
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-[var(--muted)]">Clicks</div>
                      <TextInput type="number" value={d?.clicks ?? String(r.clicks)} onChange={(v) => setDraft((prev) => ({ ...prev, [r.keyword]: { ...prev[r.keyword], clicks: v } }))} />
                    </div>
                    <div>
                      <div className="mb-2 text-xs text-[var(--muted)]">Purchases</div>
                      <TextInput type="number" value={d?.purchases ?? String(r.purchases)} onChange={(v) => setDraft((prev) => ({ ...prev, [r.keyword]: { ...prev[r.keyword], purchases: v } }))} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
                    <span>Updated {new Date(r.updated_at).toLocaleString()}</span>
                    <Button variant="outline" onClick={() => saveRow(r.keyword)}>Save changes</Button>
                  </div>
                </section>
              );
            })}
          </div>

          {!rows.length && <div className="text-sm text-[var(--muted)]">No offer data yet.</div>}
        </div>
      </Card>
    </div>
  );
}
