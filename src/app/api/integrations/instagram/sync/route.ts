import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { runInstagramSync } from '@/lib/integrations/instagram/sync';
import { getInstagramEnv } from '@/lib/env';

export const runtime = 'nodejs';

function assertAuthorized() {
  // Simple protection: require a server-known secret header.
  // The dashboard UI triggers sync via a server action (so secrets are not exposed to the client).
  const h = headers();
  const token = h.get('x-gb-sync-token');
  const env = getInstagramEnv();
  if (!token || token !== env.META_APP_SECRET) {
    throw new Error('Unauthorized');
  }
}

export async function POST() {
  try {
    assertAuthorized();
    const result = await runInstagramSync();
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed';
    const status = msg === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
