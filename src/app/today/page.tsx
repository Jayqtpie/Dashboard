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
    <div className="space-y-10">
      <PageHeader
        eyebrow="Today"
        title="A daily rhythm with more presence and less noise"
        description={`Choose the invitation, finish the essentials, and protect one 20-minute engagement block. ${pct}% of today is already complete.`}
        right={
          <div className="soft-well rounded-[30px] border border-[var(--border)] p-5">
            <div className="eyebrow">Chosen invitation</div>
            <div className="mt-3 truncate font-serif-ui text-3xl text-[var(--foreground)]">{picked || 'Not chosen yet'}</div>
            <div className="mt-4 flex gap-2">
              <Button onClick={pickKeyword} disabled={!activeKeywords.length}>Choose</Button>
              <Button variant="ghost" onClick={() => setPicked('')}>Clear</Button>
            </div>
          </div>
        }
      />

      <section className="stat-strip grid gap-5 py-5 sm:grid-cols-3">
        <StatTile label="Checklist progress" value={`${pct}%`} hint={`${completed} of ${items.length || 0} complete`} accent="plum" />
        <StatTile label="Active CTA keywords" value={activeKeywords.length} hint="Only active phrases enter the random pick." accent="peach" />
        <StatTile label="Focus block" value="20 min" hint="One concentrated engagement window after publishing." accent="sage" />
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card title="Focus window" subtitle="Use this immediately after posting, while the conversation is still warm.">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-end">
            <div className="border-t border-[var(--line)] pt-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">Time remaining</div>
              <div className="mt-4 font-mono text-[4.25rem] leading-none text-[var(--foreground)] sm:text-[5.6rem]">{fmt(remaining)}</div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
                {picked ? <>This session is anchored to <span className="font-semibold text-[var(--gb-berry)]">{picked}</span>.</> : 'Tip: choose a CTA phrase first so the session carries a clear intention.'}
              </p>
            </div>
            <div className="flex gap-2 lg:flex-col lg:items-stretch">
              {!timerRunning ? <Button onClick={startTimer}>Start session</Button> : <Button variant="outline" onClick={pauseTimer}>Pause</Button>}
              <Button variant="ghost" onClick={resetTimer}>Reset</Button>
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-[var(--muted)]">When the timer completes, the engagement session is marked complete in local data automatically.</p>
        </Card>

        <Card title="CTA library" subtitle="Keep your invitations editable, intentional, and easy to pick from.">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k.id}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-peach)]/60 ${k.active ? 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)]' : 'border-transparent bg-[var(--interactive-soft)] text-[var(--muted)] hover:bg-[var(--interactive-soft-hover)]'}`}
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

            <div className="data-ribbon pt-5">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Currently active</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeKeywords.length ? activeKeywords.map((k) => <span key={k} className="rounded-full border border-[var(--border)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">{k}</span>) : <span className="text-sm text-[var(--muted)]">No active CTA keywords yet.</span>}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Today’s flow" subtitle="A short list you can finish without making the page feel like paperwork.">
        <div className="space-y-4">
          <div className="grid gap-3">
            {items.map((it, index) => (
              <label key={it.id} className="grid cursor-pointer gap-3 border-t border-[var(--line)] py-4 sm:grid-cols-[40px_minmax(0,1fr)]">
                <div className="flex items-start justify-center pt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{String(index + 1).padStart(2, '0')}</div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 accent-[var(--gb-peach)]" checked={it.done === 1} onChange={(e) => toggle(it.id, e.target.checked)} />
                  <div className={`text-sm leading-7 ${it.done ? 'line-through text-[var(--muted)]' : 'text-[var(--muted-strong)]'}`}>{it.label}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="grid gap-2 pt-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <TextInput value={newItem} onChange={setNewItem} placeholder="Add a meaningful next step" />
            <Button onClick={addChecklist}>Add step</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
