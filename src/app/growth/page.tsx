'use client';

import { useEffect, useMemo, useState } from 'react';
import InstagramStatsInput from '@/components/instagram-stats-input';
import { Button, Card, PageHeader, StatTile, TextArea, TextInput } from '@/components/ui';

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
    const latest = [...metrics].map((m) => new Date(m.updated_at).getTime()).sort((a, b) => b - a)[0];
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
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        eyebrow="Growth"
        title="Read the signal, then make one good decision"
        description="This page is now less like a dashboard wall and more like a weekly review studio: metrics, copy learnings, and gentle decision-making in one flow."
        right={<div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">Tap any metric card to update it.</div>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Metrics tracked" value={metrics.length} hint={latestMetricUpdate} accent="teal" />
        <StatTile label="Hooks saved" value={hooks.length} hint="Ideas worth revisiting." accent="gold" />
        <StatTile label="CTAs saved" value={ctas.length} hint="Clear invitations that are working." accent="cream" />
        <StatTile label="Review notes" value={notes.length} hint="Small decisions captured while fresh." accent="teal" />
      </section>

      <InstagramStatsInput />

      <section className="space-y-3">
        <div>
          <h2 className="font-serif-ui text-3xl text-[var(--foreground)]">Performance snapshot</h2>
          <p className="text-sm text-[var(--muted)]">Keep the first view focused on signal, not clutter.</p>
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
              className="rounded-[28px] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,white_6%)] p-5 text-left transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-[var(--foreground)]">{m.label}</div>
                  <div className="mt-3 text-3xl font-semibold leading-none text-[var(--foreground)]">
                    {m.value}
                    <span className="ml-1 text-xs font-medium text-[var(--muted)]">{m.unit ?? ''}</span>
                  </div>
                </div>
                <Button variant="outline">Edit</Button>
              </div>
              <div className="mt-4 text-xs text-[var(--muted)]">Updated {new Date(m.updated_at).toLocaleString()}</div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <Card title="Copy library" subtitle="Keep proven hooks and invitations together so writing feels easier next time.">
            <div className="mb-5 flex flex-wrap gap-2">
              {([
                { key: 'all', label: 'All copy' },
                { key: 'hook', label: 'Hooks only' },
                { key: 'cta', label: 'CTAs only' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCopyFilter(f.key)}
                  className={`min-h-10 rounded-full px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${copyFilter === f.key ? 'bg-[var(--surface-soft)] text-[var(--foreground)]' : 'bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {copyFilter !== 'cta' && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Hooks</div>
                  <div className="space-y-2">
                    {visibleHooks.map((h) => (
                      <div key={h.id} className="rounded-[24px] bg-[var(--surface-soft)] px-4 py-3">
                        <div className="text-xs text-[var(--muted)]">Confidence score {h.score}/10</div>
                        <div className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{h.text}</div>
                      </div>
                    ))}
                    {!visibleHooks.length && <div className="text-sm text-[var(--muted)]">No hooks yet.</div>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <TextInput value={newHook} onChange={setNewHook} placeholder="Add a hook worth saving" />
                    <Button onClick={() => {
                      const t = newHook.trim();
                      if (!t) return;
                      addList('hook', t);
                      setNewHook('');
                    }}>Add hook</Button>
                  </div>
                </div>
              )}

              {copyFilter !== 'hook' && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Calls to action</div>
                  <div className="space-y-2">
                    {visibleCtas.map((c) => (
                      <div key={c.id} className="rounded-[24px] bg-[var(--surface-soft)] px-4 py-3">
                        <div className="text-xs text-[var(--muted)]">Confidence score {c.score}/10</div>
                        <div className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">{c.text}</div>
                      </div>
                    ))}
                    {!visibleCtas.length && <div className="text-sm text-[var(--muted)]">No CTAs yet.</div>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <TextInput value={newCta} onChange={setNewCta} placeholder="Add a CTA worth repeating" />
                    <Button onClick={() => {
                      const t = newCta.trim();
                      if (!t) return;
                      addList('cta', t);
                      setNewCta('');
                    }}>Add CTA</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Decision notes" subtitle="Keep the review language gentle and action-oriented.">
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ['do_more', 'Do more', 'Double down on what is actually compounding.'],
                ['stop', 'Stop', 'Remove drag and protect your energy.'],
                ['test', 'Test', 'Try one small experiment at a time.'],
              ] as const).map(([key, title, desc]) => (
                <section key={key} className="rounded-[28px] bg-[var(--surface-soft)] p-4 sm:p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{title}</div>
                  <p className="mt-1 text-sm text-[var(--muted)]">{desc}</p>
                  <ul className="mt-4 space-y-2.5">
                    {byKind[key].map((n) => (
                      <li key={n.id} className="rounded-[20px] bg-[var(--surface)] px-3.5 py-3 text-sm leading-6 text-[var(--muted-strong)]">{n.text}</li>
                    ))}
                    {!byKind[key].length && <li className="rounded-[20px] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--muted)]">No notes yet.</li>}
                  </ul>
                </section>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick capture" subtitle="Write the learning before it disappears.">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[var(--muted)]">Category</div>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  {(['do_more', 'stop', 'test'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setNewNoteKind(k)}
                      className={`min-h-11 rounded-[18px] px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${newNoteKind === k ? 'bg-[var(--surface-soft)] text-[var(--foreground)]' : 'bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                    >
                      {kindLabel(k)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-[var(--muted)]">Note</div>
                <div className="mt-2">
                  <TextArea value={newNote} onChange={setNewNote} placeholder="What did you learn, notice, or want to test next?" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={addNote}>Save note</Button>
              </div>
            </div>
          </Card>

          <Card title="Weekly reflection" subtitle="Two prompts to keep your review grounded.">
            <div className="space-y-2 text-sm leading-6 text-[var(--muted)]">
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">What felt most resonant this week, and what made it resonate?</div>
              <div className="rounded-[24px] bg-[var(--surface-soft)] p-4">What is the smallest next experiment that could strengthen a core metric?</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
