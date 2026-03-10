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
    <div className="space-y-10">
      <PageHeader
        eyebrow="Signal"
        title="Read what is compounding, then make one good decision"
        description="Growth is now arranged like a review studio: numbers first, then language, then judgment. It is more editorial, less dashboard wall."
        right={<div className="soft-well rounded-[26px] border border-[var(--border)] px-5 py-4 text-sm leading-6 text-[var(--muted)]">Tap any metric to update it in place. Fast input, less ceremony.</div>}
      />

      <section className="stat-strip grid gap-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Metrics tracked" value={metrics.length} hint={latestMetricUpdate} accent="plum" />
        <StatTile label="Hooks saved" value={hooks.length} hint="Ideas worth reusing and reshaping." accent="peach" />
        <StatTile label="CTAs saved" value={ctas.length} hint="Invitations that already carry evidence." accent="sage" />
        <StatTile label="Review notes" value={notes.length} hint="Small decisions captured while still fresh." accent="plum" />
      </section>

      <InstagramStatsInput />

      <Card title="Performance snapshot" subtitle="Keep the first read focused on signal, not clutter.">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
              className="group border-t border-[var(--line)] pt-5 text-left transition hover:translate-y-[-2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)]/60"
            >
              <div className="text-sm font-medium text-[var(--foreground)]">{m.label}</div>
              <div className="mt-4 text-4xl font-semibold leading-none text-[var(--foreground)]">
                {m.value}
                <span className="ml-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">{m.unit ?? ''}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
                <span>Updated {new Date(m.updated_at).toLocaleString()}</span>
                <span className="font-semibold text-[var(--gb-amber)] group-hover:text-[var(--foreground)]">Edit</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="space-y-10">
          <Card title="Copy library" subtitle="Keep hooks and invitations together so future writing starts with better raw material.">
            <div className="mb-6 flex flex-wrap gap-2">
              {([
                { key: 'all', label: 'All copy' },
                { key: 'hook', label: 'Hooks only' },
                { key: 'cta', label: 'CTAs only' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setCopyFilter(f.key)}
                  className={`min-h-10 rounded-full px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)]/60 ${copyFilter === f.key ? 'bg-[var(--surface-soft)] text-[var(--foreground)]' : 'bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
              {copyFilter !== 'cta' && (
                <div className="space-y-4">
                  <div className="eyebrow">Hooks</div>
                  <div className="space-y-3">
                    {visibleHooks.map((h) => (
                      <div key={h.id} className="border-t border-[var(--line)] pt-4">
                        <div className="ui-label">Confidence score {h.score}/10</div>
                        <div className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">{h.text}</div>
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
                <div className="space-y-4">
                  <div className="eyebrow">Calls to action</div>
                  <div className="space-y-3">
                    {visibleCtas.map((c) => (
                      <div key={c.id} className="border-t border-[var(--line)] pt-4">
                        <div className="ui-label">Confidence score {c.score}/10</div>
                        <div className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">{c.text}</div>
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

          <Card title="Decision notes" subtitle="Review language should help you act, not just archive.">
            <div className="grid gap-8 md:grid-cols-3">
              {([
                ['do_more', 'Do more', 'Double down on what is genuinely compounding.'],
                ['stop', 'Stop', 'Remove drag and protect your energy.'],
                ['test', 'Test', 'Run one small experiment at a time.'],
              ] as const).map(([key, title, desc]) => (
                <section key={key} className="border-t border-[var(--line)] pt-5">
                  <div className="ui-label">{title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{desc}</p>
                  <ul className="mt-4 space-y-3">
                    {byKind[key].map((n) => (
                      <li key={n.id} className="text-sm leading-7 text-[var(--muted-strong)]">{n.text}</li>
                    ))}
                    {!byKind[key].length && <li className="text-sm text-[var(--muted)]">No notes yet.</li>}
                  </ul>
                </section>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-10">
          <Card title="Quick capture" subtitle="Write the learning before it evaporates.">
            <div className="space-y-5">
              <div>
                <div className="ui-label">Category</div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  {(['do_more', 'stop', 'test'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setNewNoteKind(k)}
                      className={`min-h-11 rounded-[18px] px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-amber)]/60 ${newNoteKind === k ? 'bg-[var(--surface-soft)] text-[var(--foreground)]' : 'bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                    >
                      {kindLabel(k)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="ui-label">Note</div>
                <div className="mt-3">
                  <TextArea value={newNote} onChange={setNewNote} placeholder="What did you learn, notice, or want to test next?" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={addNote}>Save note</Button>
              </div>
            </div>
          </Card>

          <Card title="Weekly reflection" subtitle="Two prompts to keep the review grounded.">
            <div className="space-y-4 text-sm leading-7 text-[var(--muted-strong)]">
              <div className="border-t border-[var(--line)] pt-4">What felt most resonant this week, and what gave it that resonance?</div>
              <div className="border-t border-[var(--line)] pt-4">What is the smallest next experiment that could strengthen a core metric?</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
