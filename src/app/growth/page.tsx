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
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        eyebrow="GROWTH"
        title="Metrics + proven copy, in one place"
        description="Keep your best hooks and CTAs tight, then capture decisions while reviewing what is working."
        right={
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            Tip: use “Edit” to update metrics quickly.
          </div>
        }
      />

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
                  <div className="text-4xl font-semibold leading-none text-[var(--foreground)]">
                    {m.value}
                    <span className="ml-1 text-sm font-medium text-[var(--muted)]">{m.unit ?? ''}</span>
                  </div>
                  <div className="text-xs text-[var(--muted)]">Key: {m.key}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Top Hooks" subtitle="Short list of proven openings.">
              <div className="space-y-4">
                <div className="space-y-2">
                  {hooks.map((h) => (
                    <div key={h.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <div className="text-xs text-[var(--muted)]">Score {h.score}/10</div>
                      <div className="mt-2 text-sm leading-6">{h.text}</div>
                    </div>
                  ))}
                  {!hooks.length && <div className="text-sm text-[var(--muted)]">No hooks yet.</div>}
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
                    Add
                  </Button>
                </div>
              </div>
            </Card>

            <Card title="Top CTAs" subtitle="Strong CTAs, consistent keywords.">
              <div className="space-y-4">
                <div className="space-y-2">
                  {ctas.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <div className="text-xs text-[var(--muted)]">Score {c.score}/10</div>
                      <div className="mt-2 text-sm leading-6">{c.text}</div>
                    </div>
                  ))}
                  {!ctas.length && <div className="text-sm text-[var(--muted)]">No CTAs yet.</div>}
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
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Decisions board"
            subtitle="Keep actions grouped so weekly review stays crisp and readable."
            className="space-y-0"
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {([
                { key: 'do_more', title: 'Do More', subtitle: 'Double down on what is compounding.' },
                { key: 'stop', title: 'Stop', subtitle: 'Remove drag and protect focus.' },
                { key: 'test', title: 'Test', subtitle: 'Run one small experiment at a time.' },
              ] as const).map((section) => {
                const items = byKind[section.key];
                return (
                  <section key={section.key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{section.title}</div>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{section.subtitle}</p>
                    <ul className="mt-4 space-y-2.5">
                      {items.map((n) => (
                        <li key={n.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm leading-5 text-[var(--muted-strong)]">
                          {n.text}
                        </li>
                      ))}
                      {!items.length && <li className="rounded-xl border border-dashed border-[var(--border)] px-3.5 py-3 text-sm text-[var(--muted)]">No notes yet.</li>}
                    </ul>
                  </section>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick Capture" subtitle="Log the insight while it is still fresh.">
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
                          ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]'
                          : 'border-transparent bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'
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

          <Card title="Review Prompt" subtitle="A two-minute reset before writing.">
            <div className="space-y-3 text-sm leading-6 text-[var(--muted)]">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                What performed best this week, and why?
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                What is the smallest test that could move a core metric?
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
