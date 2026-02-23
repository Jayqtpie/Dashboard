'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, TextArea, TextInput } from '@/components/ui';

type GrowthMetric = { key: string; label: string; value: number; unit: string | null; updated_at: string };
type GrowthListItem = { id: number; kind: 'hook' | 'cta'; text: string; score: number; created_at: string };
type GrowthNote = { id: number; kind: 'do_more' | 'stop' | 'test'; text: string; updated_at: string };

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
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.key} title={m.label} subtitle={`Updated ${new Date(m.updated_at).toLocaleString()}`}>
            <div className="flex items-end justify-between gap-3">
              <div className="text-3xl font-semibold text-[var(--gb-cream)]">
                {m.value}
                <span className="ml-1 text-sm font-medium text-[var(--muted)]">{m.unit ?? ''}</span>
              </div>
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
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Top Hooks" subtitle="Keep a short list of proven openings.">
          <div className="space-y-3">
            <div className="space-y-2">
              {hooks.map((h) => (
                <div key={h.id} className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
                  <div className="text-xs text-[var(--muted)]">Score {h.score}/10</div>
                  <div className="mt-1 text-sm">{h.text}</div>
                </div>
              ))}
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
          <div className="space-y-3">
            <div className="space-y-2">
              {ctas.map((c) => (
                <div key={c.id} className="rounded-xl border border-[var(--border)] bg-black/20 p-3">
                  <div className="text-xs text-[var(--muted)]">Score {c.score}/10</div>
                  <div className="mt-1 text-sm">{c.text}</div>
                </div>
              ))}
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

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Do More" subtitle="Double down on what’s working.">
          <ul className="space-y-2">
            {byKind.do_more.map((n) => (
              <li key={n.id} className="rounded-xl border border-[var(--border)] bg-black/20 p-3 text-sm">
                {n.text}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Stop" subtitle="Remove drag. Protect focus.">
          <ul className="space-y-2">
            {byKind.stop.map((n) => (
              <li key={n.id} className="rounded-xl border border-[var(--border)] bg-black/20 p-3 text-sm">
                {n.text}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Test" subtitle="Small experiments, fast feedback.">
          <ul className="space-y-2">
            {byKind.test.map((n) => (
              <li key={n.id} className="rounded-xl border border-[var(--border)] bg-black/20 p-3 text-sm">
                {n.text}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Add a Note" subtitle="Capture next moves while you see them.">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="text-xs text-[var(--muted)]">Category</div>
            <div className="mt-2 flex gap-2">
              {(['do_more', 'stop', 'test'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setNewNoteKind(k)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    newNoteKind === k
                      ? 'border-[var(--border)] bg-white/5 text-[var(--gb-cream)]'
                      : 'border-transparent bg-black/20 text-[var(--muted)] hover:bg-white/5'
                  }`}
                >
                  {k.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <TextArea value={newNote} onChange={setNewNote} placeholder="Write the note…" />
            <div className="mt-2 flex justify-end">
              <Button onClick={addNote}>Save Note</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
