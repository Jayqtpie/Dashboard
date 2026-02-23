import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const keywords = db
    .prepare('SELECT id, keyword, active FROM cta_keywords ORDER BY active DESC, keyword ASC')
    .all();
  return NextResponse.json({ keywords });
}

const PostSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add'), keyword: z.string().min(2) }),
  z.object({ action: z.literal('setActive'), id: z.number().int().positive(), active: z.boolean() }),
]);

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());

  if (body.action === 'add') {
    db.prepare('INSERT OR IGNORE INTO cta_keywords (keyword, active) VALUES (?, 1)').run(
      body.keyword.trim().toUpperCase()
    );
  }

  if (body.action === 'setActive') {
    db.prepare('UPDATE cta_keywords SET active = ? WHERE id = ?').run(body.active ? 1 : 0, body.id);
  }

  return GET();
}
