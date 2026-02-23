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
  const [draft, setDraft] = useState<Record<string, { trigger_count: string; clicks: string; purchases: string }>>({});

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
    <div className="space-y-5">
      <Card
        title="Funnel — Keyword Performance"
        subtitle="Track trigger → click → purchase. Keep the system honest."
        right={<div className="text-xs text-[var(--muted)]">Overall conversion: {pct(totals.purchases, totals.clicks)}%</div>}
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
                    <td className="rounded-l-2xl px-3 py-3 font-semibold tracking-wide text-[var(--gb-gold)]">
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
                    <td className="px-3 py-3 text-[var(--gb-cream)]">
                      {pct(Number(d?.purchases ?? r.purchases), Number(d?.clicks ?? r.clicks))}%
                    </td>
                    <td className="rounded-r-2xl px-3 py-3">
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

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">Total triggers</div>
            <div className="mt-1 text-2xl font-semibold">{totals.trigger}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">Total clicks</div>
            <div className="mt-1 text-2xl font-semibold">{totals.clicks}</div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
            <div className="text-xs text-[var(--muted)]">Total purchases</div>
            <div className="mt-1 text-2xl font-semibold">{totals.purchases}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
