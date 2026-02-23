import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const last = db
    .prepare(
      'SELECT id, started_at, duration_sec, completed_at, note FROM engagement_sessions ORDER BY id DESC LIMIT 1'
    )
    .get();
  return NextResponse.json({ last });
}

const PostSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start'), durationSec: z.number().int().min(60).max(60 * 60), note: z.string().optional() }),
  z.object({ action: z.literal('complete'), id: z.number().int().positive() }),
]);

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());

  if (body.action === 'start') {
    const startedAt = new Date().toISOString();
    const res = db
      .prepare('INSERT INTO engagement_sessions (started_at, duration_sec, note) VALUES (?, ?, ?)')
      .run(startedAt, body.durationSec, body.note ?? null);
    return NextResponse.json({ id: res.lastInsertRowid, startedAt });
  }

  if (body.action === 'complete') {
    db.prepare('UPDATE engagement_sessions SET completed_at = ? WHERE id = ?')
      .run(new Date().toISOString(), body.id);
  }

  return GET();
}
