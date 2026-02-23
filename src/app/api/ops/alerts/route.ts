import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const alerts = db
    .prepare('SELECT id, severity, message, created_at, resolved FROM ops_alerts ORDER BY resolved ASC, id DESC LIMIT 20')
    .all();
  return NextResponse.json({ alerts });
}

const PostSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('add'),
    severity: z.enum(['info', 'warn', 'critical']),
    message: z.string().min(3),
  }),
  z.object({ action: z.literal('resolve'), id: z.number().int().positive(), resolved: z.boolean() }),
]);

export async function POST(req: Request) {
  const db = getDb();
  const body = PostSchema.parse(await req.json());

  if (body.action === 'add') {
    db.prepare('INSERT INTO ops_alerts (severity, message, resolved) VALUES (?, ?, 0)').run(
      body.severity,
      body.message
    );
  }

  if (body.action === 'resolve') {
    db.prepare('UPDATE ops_alerts SET resolved = ? WHERE id = ?').run(body.resolved ? 1 : 0, body.id);
  }

  return GET();
}
