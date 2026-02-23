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
  const base = 'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold border';
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
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Ops Health" subtitle="High-level system check — keep it boring." right={<div className="text-xs text-[var(--muted)]">Status: <span className="text-[var(--gb-gold)]">{health}</span></div>}>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs text-[var(--muted)]">Zapier success</div>
                <div className="mt-2"><TextInput type="number" value={zapierSuccess} onChange={setZapierSuccess} /></div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Zapier fail</div>
                <div className="mt-2"><TextInput type="number" value={zapierFail} onChange={setZapierFail} /></div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)]">Delivery errors</div>
                <div className="mt-2"><TextInput type="number" value={deliveryErrors} onChange={setDeliveryErrors} /></div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveRollup}>Save</Button>
            </div>
            {rollup?.updated_at && (
              <div className="text-xs text-[var(--muted)]">Last updated: {new Date(rollup.updated_at).toLocaleString()}</div>
            )}
          </div>
        </Card>

        <Card title="Delivery Errors" subtitle="If these rise, fix immediately.">
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-xs tracking-[0.25em] text-[var(--muted)]">ERROR COUNT</div>
            <div className="mt-2 text-5xl font-semibold">{rollup?.delivery_errors ?? '—'}</div>
            <div className="mt-2 text-xs text-[var(--muted)]">Track email / webhook / fulfillment failures.</div>
          </div>
        </Card>

        <Card title="Zapier" subtitle="Success vs fail (recent window).">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
              <div className="text-xs text-[var(--muted)]">Success</div>
              <div className="mt-1 text-3xl font-semibold">{rollup?.zapier_success ?? '—'}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
              <div className="text-xs text-[var(--muted)]">Fail</div>
              <div className="mt-1 text-3xl font-semibold">{rollup?.zapier_fail ?? '—'}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Alerts" subtitle="Create alerts manually (MVP) — later this can be automated.">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="text-xs text-[var(--muted)]">Severity</div>
            <div className="mt-2 flex gap-2">
              {(['info', 'warn', 'critical'] as const).map((s) => (
                <button
                  key={s}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
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
            <div className="mt-3">
              <div className="text-xs text-[var(--muted)]">Message</div>
              <div className="mt-2">
                <TextInput value={newMsg} onChange={setNewMsg} placeholder="e.g., Stripe webhook failing" />
              </div>
              <div className="mt-2 flex justify-end">
                <Button onClick={addAlert}>Add Alert</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={badge(a.severity)}>{a.severity}</span>
                        {a.resolved === 1 && (
                          <span className="text-xs text-[var(--muted)]">resolved</span>
                        )}
                      </div>
                      <div className="mt-2 text-sm">{a.message}</div>
                      <div className="mt-2 text-xs text-[var(--muted)]">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
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
              {!alerts.length && (
                <div className="text-sm text-[var(--muted)]">No alerts.</div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
