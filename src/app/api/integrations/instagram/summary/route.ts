import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const RangeSchema = z.enum(['7d', '30d']).default('7d');

function dateNDaysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const db = getDb();

  const url = new URL(req.url);
  const range = RangeSchema.parse(url.searchParams.get('range') ?? '7d');
  const days = range === '7d' ? 7 : 30;
  const since = dateNDaysAgo(days);

  const account = db
    .prepare(
      `SELECT ig_user_id, username, name, profile_picture_url, followers_count, media_count, updated_at
       FROM ig_accounts
       ORDER BY updated_at DESC
       LIMIT 1`
    )
    .get();

  const accountMetrics = db
    .prepare(
      `SELECT metric, SUM(value) as total
       FROM ig_daily_account_insights
       WHERE date >= ?
       GROUP BY metric`
    )
    .all(since);

  const topMedia = db
    .prepare(
      `SELECT m.id, m.permalink, m.caption, m.media_type, m.timestamp,
              MAX(CASE WHEN i.metric = 'impressions' THEN i.value END) AS impressions,
              MAX(CASE WHEN i.metric = 'reach' THEN i.value END) AS reach,
              MAX(CASE WHEN i.metric = 'engagement' THEN i.value END) AS engagement
       FROM ig_media m
       LEFT JOIN ig_media_insights i ON i.media_id = m.id AND i.date >= ?
       GROUP BY m.id
       ORDER BY impressions DESC NULLS LAST
       LIMIT 5`
    )
    .all(since);

  const lastRun = db
    .prepare(
      `SELECT id, started_at, finished_at, status, error_message
       FROM ig_sync_runs
       ORDER BY id DESC
       LIMIT 1`
    )
    .get();

  return NextResponse.json({
    range,
    since,
    account: account ?? null,
    accountMetrics,
    topMedia,
    lastRun: lastRun ?? null,
  });
}
