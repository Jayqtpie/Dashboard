import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const metrics = db
    .prepare('SELECT key, label, value, unit, updated_at FROM growth_metrics ORDER BY key ASC')
    .all();
  return NextResponse.json({ metrics });
}

const PostSchema = z.object({
  key: z.string().min(1),
  value: z.number(),
});

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());
  db.prepare('UPDATE growth_metrics SET value = ?, updated_at = datetime(\'now\') WHERE key = ?').run(
    body.value,
    body.key
  );
  return GET();
}
