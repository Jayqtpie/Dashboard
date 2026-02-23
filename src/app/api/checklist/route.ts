import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const items = db
    .prepare('SELECT id, label, done, order_index FROM checklist_items ORDER BY order_index ASC, id ASC')
    .all();
  return NextResponse.json({ items });
}

const PostSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('toggle'), id: z.number().int().positive(), done: z.boolean() }),
  z.object({ action: z.literal('add'), label: z.string().min(2), order_index: z.number().int().optional() }),
  z.object({ action: z.literal('reorder'), ids: z.array(z.number().int().positive()).min(1) }),
]);

export async function POST(req: Request) {
  const db = getDb();
  const json = await req.json();
  const body = PostSchema.parse(json);

  if (body.action === 'toggle') {
    db.prepare('UPDATE checklist_items SET done = ? WHERE id = ?').run(body.done ? 1 : 0, body.id);
  }

  if (body.action === 'add') {
    const row = db
      .prepare('SELECT COALESCE(MAX(order_index), -1) as m FROM checklist_items')
      .get() as { m: number };
    const max = row.m;
    const oi = body.order_index ?? max + 1;
    db.prepare('INSERT INTO checklist_items (label, done, order_index) VALUES (?, 0, ?)').run(body.label, oi);
  }

  if (body.action === 'reorder') {
    const stmt = db.prepare('UPDATE checklist_items SET order_index = ? WHERE id = ?');
    const tx = db.transaction((ids: number[]) => {
      ids.forEach((id, idx) => stmt.run(idx, id));
    });
    tx(body.ids);
  }

  return GET();
}
