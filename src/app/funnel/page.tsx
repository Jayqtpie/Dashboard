'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, TextInput } from '@/components/ui';

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
  const [draft, setDraft] = useState<
    Record<string, { trigger_count: string; clicks: string; purchases: string }>
  >({});

  async function load() {
    const data = await fetch('/api/funnel').then((r) => r.json());
    setRows(data.rows);
    const d: any = {};
    data.rows.forEach((r: FunnelRow) => {
      d[r.keyword] = {
        trigger_count: String(r.trigger_count),
        clicks: String(r.clicks),
        purchases: String(r.purchases),
      };
    });
    setDraft(d);
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const t = rows.reduce(
      (acc, r) => {
        acc.trigger += r.trigger_count;
        acc.clicks += r.clicks;
        acc.purchases += r.purchases;
        return acc;
      },
      { trigger: 0, clicks: 0, purchases: 0 }
    );
    return t;
  }, [rows]);

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
    <div className="space-y-6">
      <div className="glass card-edge rounded-3xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">FUNNEL</div>
            <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-tight text-[var(--gb-cream)]">
              Keyword performance, at a glance.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Track trigger → click → purchase. Keep the system honest.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-black/25 px-4 py-3 text-sm">
            <div className="text-xs text-[var(--muted)]">Overall conversion</div>
            <div className="mt-1 text-xl font-semibold text-[var(--gb-gold)]">
              {pct(totals.purchases, totals.clicks)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Total triggers" subtitle="Keyword triggers detected">
          <div className="text-4xl font-semibold leading-none">{totals.trigger}</div>
        </Card>
        <Card title="Total clicks" subtitle="Landing clicks">
          <div className="text-4xl font-semibold leading-none">{totals.clicks}</div>
        </Card>
        <Card title="Total purchases" subtitle="Attribution window">
          <div className="text-4xl font-semibold leading-none">{totals.purchases}</div>
        </Card>
      </div>

      <Card
        title="Keyword Table"
        subtitle="Edit values and save per-row."
        right={<div className="text-xs text-[var(--muted)]">Conv % uses purchases / clicks</div>}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--muted)]">
                <th className="px-3">Keyword</th>
                <th className="px-3">Triggers</th>
                <th className="px-3">Clicks</th>
                <th className="px-3">Purchases</th>
                <th className="px-3">Conv %</th>
                <th className="px-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const d = draft[r.keyword];
                return (
                  <tr key={r.keyword} className="glass-strong">
                    <td className="rounded-l-3xl px-4 py-4 font-semibold tracking-wide text-[var(--gb-gold)]">
                      {r.keyword}
                    </td>
                    <td className="px-3 py-3">
                      <TextInput
                        type="number"
                        value={d?.trigger_count ?? String(r.trigger_count)}
                        onChange={(v) =>
                          setDraft((prev) => ({
                            ...prev,
                            [r.keyword]: { ...prev[r.keyword], trigger_count: v },
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <TextInput
                        type="number"
                        value={d?.clicks ?? String(r.clicks)}
                        onChange={(v) =>
                          setDraft((prev) => ({
                            ...prev,
                            [r.keyword]: { ...prev[r.keyword], clicks: v },
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <TextInput
                        type="number"
                        value={d?.purchases ?? String(r.purchases)}
                        onChange={(v) =>
                          setDraft((prev) => ({
                            ...prev,
                            [r.keyword]: { ...prev[r.keyword], purchases: v },
                          }))
                        }
                      />
                    </td>
                    <td className="px-3 py-3 font-semibold text-[var(--gb-cream)]">
                      {pct(Number(d?.purchases ?? r.purchases), Number(d?.clicks ?? r.clicks))}%
                    </td>
                    <td className="rounded-r-3xl px-4 py-4">
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={() => saveRow(r.keyword)}>
                          Save
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
