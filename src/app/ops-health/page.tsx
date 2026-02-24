'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, TextInput } from '@/components/ui';

type Rollup = {
  id: 1;
  zapier_success: number;
  zapier_fail: number;
  delivery_errors: number;
  updated_at: string;
};

type Alert = {
  id: number;
  severity: 'info' | 'warn' | 'critical';
  message: string;
  created_at: string;
  resolved: number;
};

function badge(sev: string) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border';
  if (sev === 'critical') return `${base} border-red-500/30 bg-red-500/10 text-red-200`;
  if (sev === 'warn') return `${base} border-amber-500/30 bg-amber-500/10 text-amber-200`;
  return `${base} border-sky-500/30 bg-sky-500/10 text-sky-200`;
}

export default function OpsHealthPage() {
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [zapierSuccess, setZapierSuccess] = useState('');
  const [zapierFail, setZapierFail] = useState('');
  const [deliveryErrors, setDeliveryErrors] = useState('');

  const [newSev, setNewSev] = useState<'info' | 'warn' | 'critical'>('warn');
  const [newMsg, setNewMsg] = useState('');

  async function load() {
    const [r, a] = await Promise.all([
      fetch('/api/ops/rollup').then((x) => x.json()),
      fetch('/api/ops/alerts').then((x) => x.json()),
    ]);
    setRollup(r.rollup);
    setAlerts(a.alerts);

    if (r.rollup) {
      setZapierSuccess(String(r.rollup.zapier_success));
      setZapierFail(String(r.rollup.zapier_fail));
      setDeliveryErrors(String(r.rollup.delivery_errors));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const health = useMemo(() => {
    if (!rollup) return '—';
    if (rollup.delivery_errors > 0 || rollup.zapier_fail > 5) return 'At Risk';
    if (rollup.zapier_fail > 0) return 'Degraded';
    return 'Healthy';
  }, [rollup]);

  async function saveRollup() {
    const body = {
      zapier_success: Math.max(0, Number(zapierSuccess || 0)),
      zapier_fail: Math.max(0, Number(zapierFail || 0)),
      delivery_errors: Math.max(0, Number(deliveryErrors || 0)),
    };
    const res = await fetch('/api/ops/rollup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    setRollup(res.rollup);
  }

  async function addAlert() {
    const message = newMsg.trim();
    if (!message) return;
    const res = await fetch('/api/ops/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', severity: newSev, message }),
    }).then((r) => r.json());
    setAlerts(res.alerts);
    setNewMsg('');
  }

  async function toggleResolved(id: number, resolved: boolean) {
    const res = await fetch('/api/ops/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', id, resolved }),
    }).then((r) => r.json());
    setAlerts(res.alerts);
  }

  return (
    <div className="space-y-6">
      <div className="glass card-edge rounded-3xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">OPS HEALTH</div>
            <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-tight text-[var(--gb-cream)]">
              Keep it boring.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Track delivery and automations, then log alerts the moment something smells off.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-black/25 px-4 py-3">
            <div className="text-xs text-[var(--muted)]">Status</div>
            <div className="mt-1 text-xl font-semibold text-[var(--gb-gold)]">{health}</div>
          </div>
        </div>
      </div>

      {/* Above the fold: metrics */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Delivery errors" subtitle="If this rises, fix immediately.">
          <div className="glass-strong rounded-3xl border border-[var(--border)]/40 p-5 min-h-[168px] flex flex-col justify-between">
            <div>
              <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">ERROR COUNT</div>
              <div className="mt-3 text-5xl font-semibold leading-none tracking-tight">{rollup?.delivery_errors ?? '—'}</div>
              <div className="mt-3 text-sm leading-6 text-[var(--muted)]">Email / webhook / fulfillment failures.</div>
            </div>
          </div>
        </Card>

        <Card title="Zapier success" subtitle="Recent window">
          <div className="rounded-3xl border border-[var(--border)] bg-black/20 p-5 min-h-[168px] flex flex-col justify-between">
            <div>
              <div className="text-5xl font-semibold leading-none tracking-tight">{rollup?.zapier_success ?? '—'}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">Successful runs</div>
            </div>
          </div>
        </Card>

        <Card title="Zapier fail" subtitle="Investigate spikes">
          <div className="rounded-3xl border border-[var(--border)] bg-black/20 p-5 min-h-[168px] flex flex-col justify-between">
            <div>
              <div className="text-5xl font-semibold leading-none tracking-tight">{rollup?.zapier_fail ?? '—'}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">Failed runs</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Inputs + quick alert creation */}
      <div className="grid gap-6 lg:items-start lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card
          title="Rollup inputs"
          subtitle={rollup?.updated_at ? `Last updated: ${new Date(rollup.updated_at).toLocaleString()}` : 'Update the rollup (MVP manual).'}
          right={<Button onClick={saveRollup}>Save</Button>}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs text-[var(--muted)]">Zapier success</div>
              <div className="mt-2">
                <TextInput type="number" value={zapierSuccess} onChange={setZapierSuccess} />
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">Zapier fail</div>
              <div className="mt-2">
                <TextInput type="number" value={zapierFail} onChange={setZapierFail} />
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--muted)]">Delivery errors</div>
              <div className="mt-2">
                <TextInput type="number" value={deliveryErrors} onChange={setDeliveryErrors} />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Create alert" subtitle="Log incidents fast (MVP manual).">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[var(--muted)]">Severity</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['info', 'warn', 'critical'] as const).map((s) => (
                  <button
                    key={s}
                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
                      newSev === s
                        ? 'border-[var(--border)] bg-white/5 text-[var(--gb-cream)]'
                        : 'border-transparent bg-black/20 text-[var(--muted)] hover:bg-white/5'
                    }`}
                    onClick={() => setNewSev(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-[var(--muted)]">Message</div>
              <div className="mt-2">
                <TextInput value={newMsg} onChange={setNewMsg} placeholder="e.g., Stripe webhook failing" />
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={addAlert}>Add alert</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-black/20 p-5">
              <div className="text-xs text-[var(--muted)]">Reminder</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                If delivery errors &gt; 0, pause new campaigns and fix first.
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Alerts" subtitle="Resolve when fixed. Keep the list short.">
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="rounded-3xl border border-[var(--border)] bg-black/20 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={badge(a.severity)}>{a.severity}</span>
                    {a.resolved === 1 && <span className="text-xs text-[var(--muted)]">resolved</span>}
                  </div>
                  <div className="mt-3 text-sm leading-6">{a.message}</div>
                  <div className="mt-3 text-xs text-[var(--muted)]">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {a.resolved === 0 ? (
                    <Button variant="outline" onClick={() => toggleResolved(a.id, true)}>
                      Resolve
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => toggleResolved(a.id, false)}>
                      Unresolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!alerts.length && <div className="text-sm text-[var(--muted)]">No alerts.</div>}
        </div>
      </Card>
    </div>
  );
}
