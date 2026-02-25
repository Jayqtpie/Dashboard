import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getInstagramEnv } from '@/lib/env';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();

  let envOk = true;
  let envError: string | null = null;
  try {
    getInstagramEnv();
  } catch (e) {
    envOk = false;
    envError = e instanceof Error ? e.message : 'Invalid Instagram env';
  }

  const lastRun = db
    .prepare(
      `SELECT id, started_at, finished_at, status, error_message, meta
       FROM ig_sync_runs
       ORDER BY id DESC
       LIMIT 1`
    )
    .get();

  return NextResponse.json({
    envOk,
    envError,
    lastRun: lastRun ?? null,
  });
}
