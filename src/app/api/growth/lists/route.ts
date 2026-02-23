import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const hooks = db
    .prepare(
      "SELECT id, kind, text, score, created_at FROM growth_lists WHERE kind = 'hook' ORDER BY score DESC, id DESC LIMIT 10"
    )
    .all();
  const ctas = db
    .prepare(
      "SELECT id, kind, text, score, created_at FROM growth_lists WHERE kind = 'cta' ORDER BY score DESC, id DESC LIMIT 10"
    )
    .all();
  return NextResponse.json({ hooks, ctas });
}

const PostSchema = z.object({
  kind: z.enum(['hook', 'cta']),
  text: z.string().min(3),
  score: z.number().int().min(0).max(10).default(7),
});

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());
  db.prepare('INSERT INTO growth_lists (kind, text, score) VALUES (?, ?, ?)').run(
    body.kind,
    body.text,
    body.score
  );
  return GET();
}
