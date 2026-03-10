'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, PageHeader, StatTile, TextInput } from '@/components/ui';

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

  const DURATION = 20 * 60;
  const [timerRunning, setTimerRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const sessionIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const activeKeywords = useMemo(() => keywords.filter((k) => k.active === 1).map((k) => k.keyword), [keywords]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch('/api/checklist').then((r) => r.json()), fetch('/api/cta-keywords').then((r) => r.json())])
      .then(([c, k]) => {
        if (cancelled) return;
        setItems(c.items);
        setKeywords(k.keywords);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!timerRunning || intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    if (!(timerRunning && remaining === 0)) return;
    const tid = window.setTimeout(() => {
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
    }, 0);
    return () => window.clearTimeout(tid);
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
    setPicked(activeKeywords[Math.floor(Math.random() * activeKeywords.length)]);
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
    <div className="space-y-6 sm:space-y-7">
      <PageHeader
        eyebrow="Today"
        title="A grounded rhythm for today’s work"
        description={`Choose your message, complete the essentials, and step into one protected 20-minute engagement window. ${pct}% of your daily list is complete.`}
        right={
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:min-w-[260px]">
            <div className="eyebrow">Chosen invitation</div>
            <div className="mt-2 truncate font-serif-ui text-2xl text-[var(--foreground)]">{picked || 'Not chosen yet'}</div>
            <div className="mt-3 flex gap-2">
              <Button onClick={pickKeyword} disabled={!activeKeywords.length}>Choose</Button>
              <Button variant="ghost" onClick={() => setPicked('')}>Clear</Button>
            </div>
          </div>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Checklist progress" value={`${pct}%`} hint={`${completed} of ${items.length || 0} complete`} accent="teal" />
        <StatTile label="Active CTA keywords" value={activeKeywords.length} hint="Only active keywords can be picked." accent="gold" />
        <StatTile label="Focus block" value="20 min" hint="A single engagement window after publishing." accent="cream" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <Card title="Focus window" subtitle="Use this after posting to reply, like, and follow up while your message is still warm.">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="rounded-[32px] border border-[var(--border)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--gb-teal)_10%,var(--surface-soft)_90%),color-mix(in_srgb,var(--surface)_94%,white_6%))] p-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Time remaining</div>
              <div className="mt-3 font-mono text-5xl leading-none text-[var(--foreground)] sm:text-6xl">{fmt(remaining)}</div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {picked ? <>Linked to <span className="font-semibold text-[var(--gb-teal)]">{picked}</span>.</> : 'Tip: choose a CTA keyword first so the session has context.'}
              </p>
            </div>
            <div className="flex gap-2 lg:flex-col">
              {!timerRunning ? <Button onClick={startTimer}>Start session</Button> : <Button variant="outline" onClick={pauseTimer}>Pause</Button>}
              <Button variant="ghost" onClick={resetTimer}>Reset</Button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">When the timer finishes, the engagement session is automatically marked complete in your local data.</p>
        </Card>

        <Card title="CTA library" subtitle="Keep your calls to action intentional and easy to manage.">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k.id}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-gold)]/60 ${k.active ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]' : 'border-transparent bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
                  onClick={async () => {
                    const res = await fetch('/api/cta-keywords', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'setActive', id: k.id, active: k.active === 0 }),
                    }).then((r) => r.json());
                    setKeywords(res.keywords);
                  }}
                >
                  {k.keyword}
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <TextInput value={newKeyword} onChange={setNewKeyword} placeholder="Add a keyword or CTA label" />
              <Button variant="outline" onClick={addKeyword}>Save</Button>
            </div>

            <div className="rounded-[28px] bg-[var(--surface-soft)] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Currently active</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeKeywords.length ? activeKeywords.map((k) => <span key={k} className="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">{k}</span>) : <span className="text-sm text-[var(--muted)]">No active CTA keywords yet.</span>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Today’s flow" subtitle="A short list you can finish with presence, not pressure.">
        <div className="space-y-3">
          <div className="grid gap-3">
            {items.map((it) => (
              <label key={it.id} className="flex cursor-pointer items-start gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:bg-[var(--interactive-soft)]">
                <input type="checkbox" className="mt-1 accent-[var(--gb-gold)]" checked={it.done === 1} onChange={(e) => toggle(it.id, e.target.checked)} />
                <div className={`text-sm leading-6 ${it.done ? 'line-through text-[var(--muted)]' : 'text-[var(--muted-strong)]'}`}>{it.label}</div>
              </label>
            ))}
          </div>

          <div className="grid gap-2 pt-1 sm:grid-cols-[minmax(0,1fr)_auto]">
            <TextInput value={newItem} onChange={setNewItem} placeholder="Add a meaningful next step" />
            <Button onClick={addChecklist}>Add step</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
