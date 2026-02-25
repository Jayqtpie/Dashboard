import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

const KEYWORDS = ['HABITS', 'BLUEPRINT', 'PLANNER', 'RAMADAN'] as const;

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      'SELECT keyword, trigger_count, clicks, purchases, updated_at FROM funnel_stats ORDER BY keyword ASC'
    )
    .all() as Array<{ keyword: string }>;

  // Ensure the 4 canonical keywords exist.
  const existing = new Set(rows.map((r) => r.keyword));
  const insert = db.prepare(
    "INSERT OR IGNORE INTO funnel_stats (keyword, trigger_count, clicks, purchases) VALUES (?, 0, 0, 0)"
  );
  KEYWORDS.forEach((k) => {
    if (!existing.has(k)) insert.run(k);
  });

  const merged = db
    .prepare(
      'SELECT keyword, trigger_count, clicks, purchases, updated_at FROM funnel_stats WHERE keyword IN (?,?,?,?) ORDER BY keyword ASC'
    )
    .all(...KEYWORDS);

  return NextResponse.json({ rows: merged });
}

const PostSchema = z.object({
  keyword: z.enum(KEYWORDS),
  trigger_count: z.number().int().min(0),
  clicks: z.number().int().min(0),
  purchases: z.number().int().min(0),
});

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());

  db.prepare(
    "UPDATE funnel_stats SET trigger_count = ?, clicks = ?, purchases = ?, updated_at = datetime('now') WHERE keyword = ?"
  ).run(body.trigger_count, body.clicks, body.purchases, body.keyword);

  return GET();
}
