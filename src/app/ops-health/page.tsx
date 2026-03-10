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
  if (sev === 'critical') return `${base} border-red-500/35 bg-red-500/12 text-red-300`;
  if (sev === 'warn') return `${base} border-amber-500/35 bg-amber-500/12 text-amber-300`;
  return `${base} border-sky-500/35 bg-sky-500/12 text-sky-300`;
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
    <div className="space-y-10">
      <PageHeader
        eyebrow="Care"
        title="Keep the business dependable and emotionally quiet"
        description="Operations is framed as care now: watch the systems supporting your work, respond early, and keep the backstage smooth enough that the front stage can stay elegant."
        right={
          <div className="soft-well rounded-[28px] border border-[var(--border)] px-5 py-4">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Current status</div>
            <div className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{health}</div>
          </div>
        }
      />

      <section className="stat-strip grid gap-5 py-5 sm:grid-cols-3">
        <StatTile label="Delivery issues" value={rollup?.delivery_errors ?? '—'} hint="Anything customer-facing that failed." accent="plum" />
        <StatTile label="Automation successes" value={rollup?.zapier_success ?? '—'} hint="Recent tasks that completed cleanly." accent="peach" />
        <StatTile label="Automation failures" value={rollup?.zapier_fail ?? '—'} hint="Failures worth catching before they compound." accent="sage" />
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card title="Business health inputs" subtitle={rollup?.updated_at ? `Last updated ${new Date(rollup.updated_at).toLocaleString()}` : 'Update the current health numbers.'} right={<Button onClick={saveRollup}>Save</Button>}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Zapier success</div>
              <TextInput type="number" value={zapierSuccess} onChange={setZapierSuccess} />
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Zapier fail</div>
              <TextInput type="number" value={zapierFail} onChange={setZapierFail} />
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Delivery errors</div>
              <TextInput type="number" value={deliveryErrors} onChange={setDeliveryErrors} />
            </div>
          </div>
        </Card>

        <Card title="Log an alert" subtitle="Fast input. Minimal drama.">
          <div className="space-y-5">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Severity</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['info', 'warn', 'critical'] as const).map((s) => (
                  <button
                    key={s}
                    className={`rounded-[18px] border px-3 py-2 text-sm font-semibold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/60 ${newSev === s ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]' : 'border-transparent bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                    onClick={() => setNewSev(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Message</div>
              <TextInput value={newMsg} onChange={setNewMsg} placeholder="What needs attention?" />
            </div>

            <div className="flex justify-end">
              <Button onClick={addAlert}>Save alert</Button>
            </div>

            <div className="border-t border-[var(--line)] pt-4 text-sm leading-7 text-[var(--muted)]">If delivery errors rise above zero, pause new pushes until the customer path is stable again.</div>
          </div>
        </Card>
      </div>

      <Card title="Open alerts" subtitle="A short readable list of what still needs tending.">
        <div className="space-y-4">
          {alerts.map((a) => (
            <div key={a.id} className="grid gap-4 border-t border-[var(--line)] pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={badge(a.severity)}>{a.severity}</span>
                  {a.resolved === 1 ? <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">resolved</span> : null}
                </div>
                <div className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">{a.message}</div>
                <div className="mt-2 text-xs text-[var(--muted)]">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                {a.resolved === 0 ? <Button variant="outline" onClick={() => toggleResolved(a.id, true)}>Resolve</Button> : <Button variant="ghost" onClick={() => toggleResolved(a.id, false)}>Reopen</Button>}
              </div>
            </div>
          ))}
          {!alerts.length && <div className="text-sm text-[var(--muted)]">No alerts right now.</div>}
        </div>
      </Card>
    </div>
  );
}
