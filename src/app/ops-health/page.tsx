'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, PageHeader, StatTile, TextInput } from '@/components/ui';

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
  if (sev === 'critical') return `${base} border-red-500/35 bg-red-500/12 text-red-200`;
  if (sev === 'warn') return `${base} border-amber-500/35 bg-amber-500/12 text-amber-200`;
  return `${base} border-sky-500/35 bg-sky-500/12 text-sky-200`;
}

export default function OperationsPage() {
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [zapierSuccess, setZapierSuccess] = useState('');
  const [zapierFail, setZapierFail] = useState('');
  const [deliveryErrors, setDeliveryErrors] = useState('');
  const [newSev, setNewSev] = useState<'info' | 'warn' | 'critical'>('warn');
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch('/api/ops/rollup').then((x) => x.json()), fetch('/api/ops/alerts').then((x) => x.json())])
      .then(([r, a]) => {
        if (cancelled) return;
        setRollup(r.rollup);
        setAlerts(a.alerts);
        if (r.rollup) {
          setZapierSuccess(String(r.rollup.zapier_success));
          setZapierFail(String(r.rollup.zapier_fail));
          setDeliveryErrors(String(r.rollup.delivery_errors));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const health = useMemo(() => {
    if (!rollup) return '—';
    if (rollup.delivery_errors > 0 || rollup.zapier_fail > 5) return 'Needs attention';
    if (rollup.zapier_fail > 0) return 'Watch closely';
    return 'Calm and healthy';
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
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        eyebrow="Care"
        title="Keep the business dependable and emotionally quiet"
        description="This page reframes operations as care: watch the systems that support your work, respond early, and keep the backstage smooth."
        right={<div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3"><div className="text-xs text-[var(--muted)]">Current status</div><div className="mt-1 text-xl font-semibold text-[var(--gb-gold)]">{health}</div></div>}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Delivery issues" value={rollup?.delivery_errors ?? '—'} hint="Anything customer-facing that failed." accent="teal" />
        <StatTile label="Automation successes" value={rollup?.zapier_success ?? '—'} hint="Recent tasks that completed cleanly." accent="gold" />
        <StatTile label="Automation failures" value={rollup?.zapier_fail ?? '—'} hint="Failures worth catching before they compound." accent="cream" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card title="Business health inputs" subtitle={rollup?.updated_at ? `Last updated ${new Date(rollup.updated_at).toLocaleString()}` : 'Update the current health numbers.'} right={<Button onClick={saveRollup}>Save</Button>}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="mb-2 text-xs text-[var(--muted)]">Zapier success</div>
              <TextInput type="number" value={zapierSuccess} onChange={setZapierSuccess} />
            </div>
            <div>
              <div className="mb-2 text-xs text-[var(--muted)]">Zapier fail</div>
              <TextInput type="number" value={zapierFail} onChange={setZapierFail} />
            </div>
            <div>
              <div className="mb-2 text-xs text-[var(--muted)]">Delivery errors</div>
              <TextInput type="number" value={deliveryErrors} onChange={setDeliveryErrors} />
            </div>
          </div>
        </Card>

        <Card title="Log an alert" subtitle="Keep issue capture fast and lightweight.">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-[var(--muted)]">Severity</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['info', 'warn', 'critical'] as const).map((s) => (
                  <button
                    key={s}
                    className={`rounded-[18px] border px-3 py-2 text-sm font-semibold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${newSev === s ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]' : 'border-transparent bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                    onClick={() => setNewSev(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-[var(--muted)]">Message</div>
              <TextInput value={newMsg} onChange={setNewMsg} placeholder="What needs attention?" />
            </div>

            <div className="flex justify-end">
              <Button onClick={addAlert}>Save alert</Button>
            </div>

            <div className="rounded-[24px] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted)]">If delivery errors rise above zero, pause new pushes until the customer path is stable again.</div>
          </div>
        </Card>
      </div>

      <Card title="Open alerts" subtitle="A short, readable list of what still needs tending.">
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={badge(a.severity)}>{a.severity}</span>
                    {a.resolved === 1 ? <span className="text-xs text-[var(--muted)]">resolved</span> : null}
                  </div>
                  <div className="mt-3 text-sm leading-6 text-[var(--muted-strong)]">{a.message}</div>
                  <div className="mt-3 text-xs text-[var(--muted)]">{new Date(a.created_at).toLocaleString()}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {a.resolved === 0 ? <Button variant="outline" onClick={() => toggleResolved(a.id, true)}>Resolve</Button> : <Button variant="ghost" onClick={() => toggleResolved(a.id, false)}>Reopen</Button>}
                </div>
              </div>
            </div>
          ))}
          {!alerts.length && <div className="text-sm text-[var(--muted)]">No alerts right now.</div>}
        </div>
      </Card>
    </div>
  );
}
