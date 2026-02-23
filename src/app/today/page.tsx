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
      body: JSON.stringify({ action: 'start', durationSec: DURATION, note: picked ? `CTA:${picked}` : undefined }),
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
    <div className="grid gap-5 lg:grid-cols-3">
      <Card
        title="Today — Posting Workflow"
        subtitle={`Keep it simple. Finish strong. (${pct}% complete)`}
      >
        <div className="space-y-3">
          {items.map((it) => (
            <label
              key={it.id}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-black/20 p-3 hover:bg-black/30"
            >
              <input
                type="checkbox"
                className="mt-1 accent-[var(--gb-gold)]"
                checked={it.done === 1}
                onChange={(e) => toggle(it.id, e.target.checked)}
              />
              <div>
                <div className={`text-sm ${it.done ? 'line-through text-[var(--muted)]' : ''}`}>
                  {it.label}
                </div>
              </div>
            </label>
          ))}

          <div className="flex gap-2 pt-1">
            <TextInput value={newItem} onChange={setNewItem} placeholder="Add a quick step…" />
            <Button onClick={addChecklist}>Add</Button>
          </div>
        </div>
      </Card>

      <Card title="CTA Keyword Picker" subtitle="Pick a keyword for today’s post — keep the funnel clean.">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <button
                key={k.id}
                className={`rounded-xl border px-3 py-2 text-xs transition ${
                  k.active
                    ? 'border-[var(--border)] bg-white/5 text-[var(--gb-cream)]'
                    : 'border-transparent bg-black/20 text-[var(--muted)]'
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

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-black/20 p-4">
            <div>
              <div className="text-xs text-[var(--muted)]">Picked</div>
              <div className="text-xl font-semibold tracking-wide text-[var(--gb-gold)]">
                {picked || '—'}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={pickKeyword} disabled={!activeKeywords.length}>
                Pick
              </Button>
              <Button variant="ghost" onClick={() => setPicked('')}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="20-Min Engagement Sprint" subtitle="Start immediately after publishing. Reply, like, and DM fast.">
        <div className="space-y-4">
          <div className="glass-strong rounded-2xl p-5">
            <div className="text-xs tracking-[0.25em] text-[var(--muted)]">COUNTDOWN</div>
            <div className="mt-2 font-mono text-5xl text-[var(--gb-cream)]">{fmt(remaining)}</div>
            <div className="mt-2 text-xs text-[var(--muted)]">
              {picked ? (
                <span>
                  Linked CTA: <span className="text-[var(--gb-gold)]">{picked}</span>
                </span>
              ) : (
                'Tip: pick a CTA keyword first so you can track responses.'
              )}
            </div>
          </div>

          <div className="flex gap-2">
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

          <div className="text-xs text-[var(--muted)]">
            When the timer hits zero we’ll mark the session completed in the local database.
          </div>
        </div>
      </Card>
    </div>
  );
}
