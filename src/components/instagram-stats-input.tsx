'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button, Card, TextInput } from '@/components/ui';

type InstagramStatEntry = {
  timestamp: string;
  followers: number;
  engagement: number;
};

function TrendLine({
  data,
  color,
  yMin,
  yMax,
}: {
  data: number[];
  color: string;
  yMin: number;
  yMax: number;
}) {
  const width = 640;
  const height = 220;
  const pad = 16;

  if (data.length === 0) return null;

  const range = yMax - yMin || 1;
  const points = data
    .map((value, index) => {
      const x = pad + (index * (width - pad * 2)) / Math.max(1, data.length - 1);
      const normalized = (value - yMin) / range;
      const y = height - pad - normalized * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" points={points} />;
}

export default function InstagramStatsInput() {
  const [followers, setFollowers] = useState('');
  const [engagement, setEngagement] = useState('');
  const [entries, setEntries] = useState<InstagramStatEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadStats() {
    const response = await fetch('/api/instagram-stats', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to load stats.');
    setEntries(Array.isArray(data.entries) ? data.entries : []);
  }

  useEffect(() => {
    loadStats().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load stats.'));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const followersValue = Number(followers);
    const engagementValue = Number(engagement);

    if (!Number.isFinite(followersValue) || followersValue < 0) {
      setError('Followers must be a non-negative number.');
      return;
    }

    if (!Number.isFinite(engagementValue) || engagementValue < 0) {
      setError('Engagement must be a non-negative number.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/instagram-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followers: followersValue, engagement: engagementValue }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to save stats.');

      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setFollowers('');
      setEngagement('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save stats.');
    } finally {
      setSaving(false);
    }
  }

  const { followersSeries, engagementSeries, yMin, yMax } = useMemo(() => {
    if (!entries.length) return { followersSeries: [], engagementSeries: [], yMin: 0, yMax: 100 };

    const followersValues = entries.map((entry) => entry.followers);
    const engagementValues = entries.map((entry) => entry.engagement);
    const all = [...followersValues, ...engagementValues];

    const min = Math.min(...all);
    const max = Math.max(...all);
    const padding = (max - min || 1) * 0.15;

    return {
      followersSeries: followersValues,
      engagementSeries: engagementValues,
      yMin: Math.max(0, min - padding),
      yMax: max + padding,
    };
  }, [entries]);

  return (
    <Card title="Instagram Stats" subtitle="Manually log followers + engagement and monitor trendlines.">
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <div className="mb-2 text-xs text-[var(--muted)]">Followers</div>
            <TextInput type="number" value={followers} onChange={setFollowers} placeholder="e.g. 12,500" />
          </div>

          <div>
            <div className="mb-2 text-xs text-[var(--muted)]">Engagement (%)</div>
            <TextInput type="number" value={engagement} onChange={setEngagement} placeholder="e.g. 4.8" />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Snapshot'}
          </Button>
        </form>

        {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="mb-3 flex flex-wrap items-center gap-5 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9a84c]" /> Followers
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2ec4b6]" /> Engagement
            </span>
          </div>

          <div className="overflow-x-auto">
            <svg viewBox="0 0 640 220" className="min-w-[520px] w-full">
              <rect x="0" y="0" width="640" height="220" fill="transparent" />
              <line x1="16" y1="204" x2="624" y2="204" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="16" y1="16" x2="16" y2="204" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <TrendLine data={followersSeries} color="#c9a84c" yMin={yMin} yMax={yMax} />
              <TrendLine data={engagementSeries} color="#2ec4b6" yMin={yMin} yMax={yMax} />
            </svg>
          </div>

          {!entries.length && <p className="mt-3 text-sm text-[var(--muted)]">No entries yet. Add your first snapshot above.</p>}
        </div>

        {entries.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <div className="mb-2 text-xs text-[var(--muted)]">History ({entries.length})</div>
            <div className="max-h-56 space-y-2 overflow-auto pr-1">
              {[...entries].reverse().map((entry) => (
                <div
                  key={`${entry.timestamp}-${entry.followers}-${entry.engagement}`}
                  className="rounded-xl border border-[var(--border)] bg-black/25 px-3 py-2 text-sm"
                >
                  <div className="text-xs text-[var(--muted)]">{new Date(entry.timestamp).toLocaleString()}</div>
                  <div className="mt-1">
                    Followers: <span className="font-semibold">{entry.followers.toLocaleString()}</span> · Engagement:{' '}
                    <span className="font-semibold">{entry.engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
