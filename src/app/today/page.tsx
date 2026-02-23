'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, TextInput } from '@/components/ui';

type ChecklistItem = { id: number; label: string; done: number; order_index: number };
type CTAKeyword = { id: number; keyword: string; active: number };

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TodayPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [keywords, setKeywords] = useState<CTAKeyword[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [picked, setPicked] = useState<string>('');

  // Timer state
  const DURATION = 20 * 60;
  const [timerRunning, setTimerRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const sessionIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const activeKeywords = useMemo(
    () => keywords.filter((k) => k.active === 1).map((k) => k.keyword),
    [keywords]
  );

  async function load() {
    const [c, k] = await Promise.all([
      fetch('/api/checklist').then((r) => r.json()),
      fetch('/api/cta-keywords').then((r) => r.json()),
    ]);
    setItems(c.items);
    setKeywords(k.keywords);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(async () => {
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && remaining === 0) {
      setTimerRunning(false);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const id = sessionIdRef.current;
      sessionIdRef.current = null;
      if (id) {
        fetch('/api/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete', id }),
        }).catch(() => {});
      }
    }
  }, [remaining, timerRunning]);

  async function toggle(id: number, done: boolean) {
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, done }),
    }).then((r) => r.json());
    setItems(res.items);
  }

  async function addChecklist() {
    const label = newItem.trim();
    if (!label) return;
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', label }),
    }).then((r) => r.json());
    setItems(res.items);
    setNewItem('');
  }

  async function addKeyword() {
    const keyword = newKeyword.trim();
    if (!keyword) return;
    const res = await fetch('/api/cta-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', keyword }),
    }).then((r) => r.json());
    setKeywords(res.keywords);
    setNewKeyword('');
  }

  function pickKeyword() {
    if (!activeKeywords.length) return;
    const k = activeKeywords[Math.floor(Math.random() * activeKeywords.length)];
    setPicked(k);
  }

  async function startTimer() {
    if (timerRunning) return;
    setRemaining(DURATION);
    setTimerRunning(true);
    const res = await fetch('/api/engagement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        durationSec: DURATION,
        note: picked ? `CTA:${picked}` : undefined,
      }),
    }).then((r) => r.json());
    sessionIdRef.current = Number(res.id);
  }

  function pauseTimer() {
    setTimerRunning(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    setRemaining(DURATION);
    sessionIdRef.current = null;
  }

  const completed = items.filter((i) => i.done === 1).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="glass card-edge rounded-3xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">TODAY</div>
            <h1 className="mt-2 text-2xl font-semibold leading-8 tracking-tight text-[var(--gb-cream)]">
              Execute clean. Publish. Sprint.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Keep the workflow tight: pick a CTA keyword, publish, then run a 20‑minute engagement sprint. ({pct}% checklist complete)
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/25 px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs text-[var(--muted)]">Picked CTA</div>
              <div className="truncate text-lg font-semibold tracking-wide text-[var(--gb-gold)]">
                {picked || '—'}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button onClick={pickKeyword} disabled={!activeKeywords.length}>
                Pick
              </Button>
              <Button variant="ghost" onClick={() => setPicked('')}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Above-the-fold: the two primary actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="20‑Min Engagement Sprint" subtitle="Start immediately after publishing. Reply, like, and DM fast.">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="glass-strong rounded-3xl p-6">
              <div className="text-[11px] tracking-[0.34em] text-[var(--muted)]">COUNTDOWN</div>
              <div className="mt-2 font-mono text-6xl leading-none text-[var(--gb-cream)]">{fmt(remaining)}</div>
              <div className="mt-3 text-sm text-[var(--muted)]">
                {picked ? (
                  <span>
                    Linked CTA: <span className="text-[var(--gb-gold)]">{picked}</span>
                  </span>
                ) : (
                  'Tip: pick a CTA keyword first so you can track responses.'
                )}
              </div>
            </div>

            <div className="flex flex-row gap-2 md:flex-col md:justify-end">
              {!timerRunning ? (
                <Button onClick={startTimer}>Start 20:00</Button>
              ) : (
                <Button onClick={pauseTimer} variant="outline">
                  Pause
                </Button>
              )}
              <Button onClick={resetTimer} variant="ghost">
                Reset
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-[var(--muted)]">
            When the timer hits zero we’ll mark the session completed in the local database.
          </div>
        </Card>

        <Card title="CTA Keywords" subtitle="Keep the funnel consistent: activate only what you want to count.">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k.id}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${
                    k.active
                      ? 'border-[var(--border)] bg-white/5 text-[var(--gb-cream)]'
                      : 'border-transparent bg-black/20 text-[var(--muted)] hover:bg-white/5'
                  }`}
                  onClick={async () => {
                    const res = await fetch('/api/cta-keywords', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'setActive', id: k.id, active: k.active === 0 }),
                    }).then((r) => r.json());
                    setKeywords(res.keywords);
                  }}
                  title="Click to toggle active"
                >
                  {k.keyword}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <TextInput value={newKeyword} onChange={setNewKeyword} placeholder="Add keyword (e.g., RESET)" />
              <Button variant="outline" onClick={addKeyword}>
                Save
              </Button>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-black/20 p-5">
              <div className="text-xs text-[var(--muted)]">Active keywords</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeKeywords.length ? (
                  activeKeywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-[var(--border)] bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-[var(--gb-cream)]"
                    >
                      {k}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--muted)]">None active — toggle at least one.</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Posting Workflow" subtitle="Keep it simple. Finish strong.">
        <div className="space-y-3">
          <div className="grid gap-2">
            {items.map((it) => (
              <label
                key={it.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] bg-black/20 p-4 transition hover:bg-black/30"
              >
                <input
                  type="checkbox"
                  className="mt-1 accent-[var(--gb-gold)]"
                  checked={it.done === 1}
                  onChange={(e) => toggle(it.id, e.target.checked)}
                />
                <div className="min-w-0">
                  <div className={`text-sm leading-6 ${it.done ? 'line-through text-[var(--muted)]' : ''}`}>
                    {it.label}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <TextInput value={newItem} onChange={setNewItem} placeholder="Add a quick step…" />
            <Button onClick={addChecklist}>Add</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
