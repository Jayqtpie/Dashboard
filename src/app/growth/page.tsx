'use client';

import { useEffect, useMemo, useState } from 'react';
import InstagramStatsInput from '@/components/instagram-stats-input';
import { Button, Card, TextArea, TextInput } from '@/components/ui';

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

  async function load() {
    const [m, l, n] = await Promise.all([
      fetch('/api/growth/metrics').then((r) => r.json()),
      fetch('/api/growth/lists').then((r) => r.json()),
      fetch('/api/growth/notes').then((r) => r.json()),
    ]);
    setMetrics(m.metrics);
    setHooks(l.hooks);
    setCtas(l.ctas);
    setNotes(n.notes);
  }

  useEffect(() => {
    load();
  }, []);

  const byKind = useMemo(() => {
    const map: Record<string, GrowthNote[]> = { do_more: [], stop: [], test: [] };
    notes.forEach((n) => map[n.kind].push(n));
    return map;
  }, [notes]);

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
    <div className="space-y-6">
      <div className="glass card-edge rounded-3xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">GROWTH</div>
            <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-tight text-[var(--gb-cream)]">
              Metrics + proven copy, in one place.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Keep your best hooks/CTAs tight, and capture decisions fast while you’re reviewing performance.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-black/25 px-4 py-3 text-sm text-[var(--muted)]">
            Tip: click “Edit” on a metric to update quickly.
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <InstagramStatsInput />

          <div className="grid gap-6 md:grid-cols-2">
            {metrics.map((m) => (
              <Card
                key={m.key}
                title={m.label}
                subtitle={`Updated ${new Date(m.updated_at).toLocaleString()}`}
                right={
                  <Button
                    variant="outline"
                    onClick={() => {
                      const raw = prompt(`New value for: ${m.label}`, String(m.value));
                      if (raw == null) return;
                      const next = Number(raw);
                      if (Number.isNaN(next)) return;
                      updateMetric(m.key, next);
                    }}
                  >
                    Edit
                  </Button>
                }
              >
                <div className="flex items-end justify-between gap-4">
                  <div className="text-4xl font-semibold leading-none text-[var(--gb-cream)]">
                    {m.value}
                    <span className="ml-1 text-sm font-medium text-[var(--muted)]">{m.unit ?? ''}</span>
                  </div>
                  <div className="text-xs text-[var(--muted)]">Key: {m.key}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Top Hooks" subtitle="Short list of proven openings (keep it sharp).">
              <div className="space-y-4">
                <div className="space-y-2">
                  {hooks.map((h) => (
                    <div key={h.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
                      <div className="text-xs text-[var(--muted)]">Score {h.score}/10</div>
                      <div className="mt-2 text-sm leading-6">{h.text}</div>
                    </div>
                  ))}
                  {!hooks.length && <div className="text-sm text-[var(--muted)]">No hooks yet.</div>}
                </div>

                <div className="flex gap-2">
                  <TextInput value={newHook} onChange={setNewHook} placeholder="Add a hook…" />
                  <Button
                    onClick={() => {
                      const t = newHook.trim();
                      if (!t) return;
                      addList('hook', t);
                      setNewHook('');
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Top CTAs" subtitle="Strong CTAs, consistent keywords.">
              <div className="space-y-4">
                <div className="space-y-2">
                  {ctas.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
                      <div className="text-xs text-[var(--muted)]">Score {c.score}/10</div>
                      <div className="mt-2 text-sm leading-6">{c.text}</div>
                    </div>
                  ))}
                  {!ctas.length && <div className="text-sm text-[var(--muted)]">No CTAs yet.</div>}
                </div>

                <div className="flex gap-2">
                  <TextInput value={newCta} onChange={setNewCta} placeholder="Add a CTA…" />
                  <Button
                    onClick={() => {
                      const t = newCta.trim();
                      if (!t) return;
                      addList('cta', t);
                      setNewCta('');
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card title="Do More" subtitle="Double down on what’s working.">
              <ul className="space-y-2">
                {byKind.do_more.map((n) => (
                  <li key={n.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4 text-sm leading-6">
                    {n.text}
                  </li>
                ))}
                {!byKind.do_more.length && <li className="text-sm text-[var(--muted)]">—</li>}
              </ul>
            </Card>
            <Card title="Stop" subtitle="Remove drag. Protect focus.">
              <ul className="space-y-2">
                {byKind.stop.map((n) => (
                  <li key={n.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4 text-sm leading-6">
                    {n.text}
                  </li>
                ))}
                {!byKind.stop.length && <li className="text-sm text-[var(--muted)]">—</li>}
              </ul>
            </Card>
            <Card title="Test" subtitle="Small experiments, fast feedback.">
              <ul className="space-y-2">
                {byKind.test.map((n) => (
                  <li key={n.id} className="rounded-2xl border border-[var(--border)] bg-black/20 p-4 text-sm leading-6">
                    {n.text}
                  </li>
                ))}
                {!byKind.test.length && <li className="text-sm text-[var(--muted)]">—</li>}
              </ul>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Quick Capture" subtitle="Add a note while it’s fresh.">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--muted)]">Category</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['do_more', 'stop', 'test'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setNewNoteKind(k)}
                      className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
                        newNoteKind === k
                          ? 'border-[var(--border)] bg-white/5 text-[var(--gb-cream)]'
                          : 'border-transparent bg-black/20 text-[var(--muted)] hover:bg-white/5'
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

          <Card title="Review Prompt" subtitle="Two-minute reset before you write.">
            <div className="space-y-3 text-sm leading-6 text-[var(--muted)]">
              <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
                What performed best this week, and why?
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-black/20 p-4">
                What’s the smallest test that could move a metric?
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
