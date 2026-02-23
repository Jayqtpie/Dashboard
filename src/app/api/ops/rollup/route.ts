import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const rollup = db
    .prepare('SELECT id, zapier_success, zapier_fail, delivery_errors, updated_at FROM ops_rollup WHERE id = 1')
    .get();
  return NextResponse.json({ rollup });
}

const PostSchema = z.object({
  zapier_success: z.number().int().min(0),
  zapier_fail: z.number().int().min(0),
  delivery_errors: z.number().int().min(0),
});

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());

  db.prepare(
    "INSERT INTO ops_rollup (id, zapier_success, zapier_fail, delivery_errors, updated_at) VALUES (1, ?, ?, ?, datetime('now'))\n     ON CONFLICT(id) DO UPDATE SET zapier_success=excluded.zapier_success, zapier_fail=excluded.zapier_fail, delivery_errors=excluded.delivery_errors, updated_at=datetime('now')"
  ).run(body.zapier_success, body.zapier_fail, body.delivery_errors);

  return GET();
}
