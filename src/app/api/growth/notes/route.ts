import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const notes = db
    .prepare(
      "SELECT id, kind, text, updated_at FROM growth_notes ORDER BY CASE kind WHEN 'do_more' THEN 1 WHEN 'stop' THEN 2 ELSE 3 END, id DESC"
    )
    .all();
  return NextResponse.json({ notes });
}

const PostSchema = z.object({
  kind: z.enum(['do_more', 'stop', 'test']),
  text: z.string().min(2),
});

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());
  db.prepare(
    "INSERT INTO growth_notes (kind, text, updated_at) VALUES (?, ?, datetime('now'))"
  ).run(body.kind, body.text);
  return GET();
}
