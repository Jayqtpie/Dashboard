'use client';

import { useEffect, useMemo, useState } from 'react';
import InstagramStatsInput from '@/components/instagram-stats-input';
import { Button, Card, PageHeader, TextArea, TextInput } from '@/components/ui';

type GrowthMetric = {
  key: string;
  label: string;
  value: number;
  unit: string | null;
  updated_at: string;
};

type GrowthListItem = {
  id: number;
  kind: 'hook' | 'cta';
  text: string;
  score: number;
  created_at: string;
};

type GrowthNote = {
  id: number;
  kind: 'do_more' | 'stop' | 'test';
  text: string;
  updated_at: string;
};

function kindLabel(k: GrowthNote['kind']) {
  if (k === 'do_more') return 'Do more';
  if (k === 'stop') return 'Stop';
  return 'Test';
}

export default function GrowthPage() {
  const [metrics, setMetrics] = useState<GrowthMetric[]>([]);
  const [hooks, setHooks] = useState<GrowthListItem[]>([]);
  const [ctas, setCtas] = useState<GrowthListItem[]>([]);
  const [notes, setNotes] = useState<GrowthNote[]>([]);

  const [newHook, setNewHook] = useState('');
  const [newCta, setNewCta] = useState('');
  const [newNoteKind, setNewNoteKind] = useState<'do_more' | 'stop' | 'test'>('do_more');
  const [newNote, setNewNote] = useState('');
  const [copyFilter, setCopyFilter] = useState<'all' | 'hook' | 'cta'>('all');

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch('/api/growth/metrics').then((r) => r.json()),
      fetch('/api/growth/lists').then((r) => r.json()),
      fetch('/api/growth/notes').then((r) => r.json()),
    ])
      .then(([m, l, n]) => {
        if (cancelled) return;
        setMetrics(m.metrics);
        setHooks(l.hooks);
        setCtas(l.ctas);
        setNotes(n.notes);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const byKind = useMemo(() => {
    const map: Record<string, GrowthNote[]> = { do_more: [], stop: [], test: [] };
    notes.forEach((n) => map[n.kind].push(n));
    return map;
  }, [notes]);

  const latestMetricUpdate = useMemo(() => {
    if (!metrics.length) return 'No metric updates yet';
    const latest = [...metrics]
      .map((m) => new Date(m.updated_at).getTime())
      .sort((a, b) => b - a)[0];
    return `Last metric update ${new Date(latest).toLocaleString()}`;
  }, [metrics]);

  const visibleHooks = copyFilter === 'cta' ? [] : hooks;
  const visibleCtas = copyFilter === 'hook' ? [] : ctas;

  async function updateMetric(key: string, value: number) {
    const res = await fetch('/api/growth/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    }).then((r) => r.json());
    setMetrics(res.metrics);
  }

  async function addList(kind: 'hook' | 'cta', text: string) {
    const res = await fetch('/api/growth/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, text, score: 7 }),
    }).then((r) => r.json());
    setHooks(res.hooks);
    setCtas(res.ctas);
  }

  async function addNote() {
    const text = newNote.trim();
    if (!text) return;
    const res = await fetch('/api/growth/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: newNoteKind, text }),
    }).then((r) => r.json());
    setNotes(res.notes);
    setNewNote('');
  }

  return (
    <div className="space-y-7 sm:space-y-8">
      <PageHeader
        eyebrow="GROWTH"
        title="Metrics + proven copy, in one place"
        description="Review signal first, then capture actions and decisions in a cleaner weekly workflow."
        right={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            Tip: tap any metric card to update via quick edit.
          </div>
        }
      />

      <Card className="space-y-5">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)] sm:text-lg">Weekly overview</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Quick scan before you dive into copy and decisions.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Metrics tracked</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{metrics.length}</div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Top hooks</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{hooks.length}</div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Top CTAs</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{ctas.length}</div>
            </div>
            <div className="rounded-2xl bg-[var(--surface-soft)] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Decision notes</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{notes.length}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[var(--muted)]">{latestMetricUpdate}</div>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all', label: 'All copy' },
                { key: 'hook', label: 'Hooks only' },
                { key: 'cta', label: 'CTAs only' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCopyFilter(f.key)}
                  className={`min-h-10 rounded-xl px-3.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
                    copyFilter === f.key
                      ? 'bg-[var(--surface-soft)] text-[var(--foreground)]'
                      : 'bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <InstagramStatsInput />

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)] sm:text-lg">Metrics</h2>
            <p className="text-sm text-[var(--muted)]">Tap edit to update values without leaving the page.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  const raw = prompt(`New value for: ${m.label}`, String(m.value));
                  if (raw == null) return;
                  const next = Number(raw);
                  if (Number.isNaN(next)) return;
                  updateMetric(m.key, next);
                }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-[var(--foreground)]">{m.label}</div>
                    <div className="mt-2 text-3xl font-semibold leading-none text-[var(--foreground)]">
                      {m.value}
                      <span className="ml-1 text-xs font-medium text-[var(--muted)]">{m.unit ?? ''}</span>
                    </div>
                  </div>
                  <Button variant="outline">Edit</Button>
                </div>
                <div className="mt-3 text-xs text-[var(--muted)]">Updated {new Date(m.updated_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card title="Copy bank" subtitle="Keep hooks and CTAs easy to scan and easy to add.">
              <div className="space-y-6">
                {copyFilter !== 'cta' && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Hooks</div>
                    <div className="space-y-2">
                      {visibleHooks.map((h) => (
                        <div key={h.id} className="rounded-xl bg-[var(--surface-soft)] px-4 py-3">
                          <div className="text-xs text-[var(--muted)]">Score {h.score}/10</div>
                          <div className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{h.text}</div>
                        </div>
                      ))}
                      {!visibleHooks.length && <div className="text-sm text-[var(--muted)]">No hooks yet.</div>}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <TextInput value={newHook} onChange={setNewHook} placeholder="Add a hook…" />
                      <Button
                        onClick={() => {
                          const t = newHook.trim();
                          if (!t) return;
                          addList('hook', t);
                          setNewHook('');
                        }}
                      >
                        Add Hook
                      </Button>
                    </div>
                  </div>
                )}

                {copyFilter !== 'hook' && (
                  <div className="space-y-3 border-t border-[var(--border)] pt-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">CTAs</div>
                    <div className="space-y-2">
                      {visibleCtas.map((c) => (
                        <div key={c.id} className="rounded-xl bg-[var(--surface-soft)] px-4 py-3">
                          <div className="text-xs text-[var(--muted)]">Score {c.score}/10</div>
                          <div className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{c.text}</div>
                        </div>
                      ))}
                      {!visibleCtas.length && <div className="text-sm text-[var(--muted)]">No CTAs yet.</div>}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <TextInput value={newCta} onChange={setNewCta} placeholder="Add a CTA…" />
                      <Button
                        onClick={() => {
                          const t = newCta.trim();
                          if (!t) return;
                          addList('cta', t);
                          setNewCta('');
                        }}
                      >
                        Add CTA
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Decision board" subtitle="Primary focus first, then supporting decisions.">
              <div className="space-y-4">
                <section className="rounded-2xl bg-[var(--surface-soft)] p-4 sm:p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Do More</div>
                  <p className="mt-1 text-sm text-[var(--muted)]">Double down on what is compounding.</p>
                  <ul className="mt-4 space-y-2.5">
                    {byKind.do_more.map((n) => (
                      <li key={n.id} className="rounded-xl bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--muted-strong)]">
                        {n.text}
                      </li>
                    ))}
                    {!byKind.do_more.length && <li className="rounded-xl bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--muted)]">No notes yet.</li>}
                  </ul>
                </section>

                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl bg-[var(--surface-soft)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Stop</div>
                    <p className="mt-1 text-sm text-[var(--muted)]">Remove drag and protect focus.</p>
                    <ul className="mt-3 space-y-2.5">
                      {byKind.stop.map((n) => (
                        <li key={n.id} className="rounded-xl bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--muted-strong)]">
                          {n.text}
                        </li>
                      ))}
                      {!byKind.stop.length && <li className="rounded-xl bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--muted)]">No notes yet.</li>}
                    </ul>
                  </section>

                  <section className="rounded-2xl bg-[var(--surface-soft)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Test</div>
                    <p className="mt-1 text-sm text-[var(--muted)]">Run one small experiment at a time.</p>
                    <ul className="mt-3 space-y-2.5">
                      {byKind.test.map((n) => (
                        <li key={n.id} className="rounded-xl bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--muted-strong)]">
                          {n.text}
                        </li>
                      ))}
                      {!byKind.test.length && <li className="rounded-xl bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--muted)]">No notes yet.</li>}
                    </ul>
                  </section>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Quick capture" subtitle="Log the insight while it is still fresh.">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-[var(--muted)]">Category</div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                    {(['do_more', 'stop', 'test'] as const).map((k) => (
                      <button
                        key={k}
                        onClick={() => setNewNoteKind(k)}
                        className={`min-h-11 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
                          newNoteKind === k
                            ? 'bg-[var(--surface-soft)] text-[var(--foreground)]'
                            : 'bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'
                        }`}
                      >
                        {kindLabel(k)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--muted)]">Note</div>
                  <div className="mt-2">
                    <TextArea value={newNote} onChange={setNewNote} placeholder="Write the note…" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={addNote}>Save Note</Button>
                </div>
              </div>
            </Card>

            <Card title="Review prompt" subtitle="A two-minute reset before writing.">
              <div className="space-y-2 text-sm leading-6 text-[var(--muted)]">
                <div className="rounded-xl bg-[var(--surface-soft)] p-4">What performed best this week, and why?</div>
                <div className="rounded-xl bg-[var(--surface-soft)] p-4">
                  What is the smallest test that could move a core metric?
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
