import { getInstagramEnv } from '@/lib/env';

type GraphError = {
  error?: {
    message: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

export type GraphPage<T> = {
  data: T[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
  };
} & GraphError;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Minimal Graph API fetch wrapper with exponential backoff.
 *
 * Notes:
 * - Meta may return 4xx with rate-limit semantics; we retry on 429/5xx.
 * - For 4xx other than 429, we surface the error.
 */
export async function graphGet<T>(path: string, params: Record<string, string | number | undefined>) {
  const env = getInstagramEnv();

  const url = new URL(`https://graph.facebook.com/${env.IG_API_VERSION}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    url.searchParams.set(k, String(v));
  }
  url.searchParams.set('access_token', env.IG_ACCESS_TOKEN);

  const maxAttempts = 5;
  let attempt = 0;
  let lastErr: unknown;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Next.js: ensure this is server-side only.
        cache: 'no-store',
      });

      if (res.status === 429 || res.status >= 500) {
        const wait = Math.min(30_000, 500 * 2 ** (attempt - 1));
        await sleep(wait);
        continue;
      }

      const json = (await res.json()) as T & GraphError;

      if (!res.ok || (json as any)?.error) {
        const e = (json as any)?.error;
        throw new Error(
          `Instagram Graph API error (${res.status}): ${e?.message ?? res.statusText}`
        );
      }

      return json;
    } catch (e) {
      lastErr = e;
      const wait = Math.min(30_000, 500 * 2 ** (attempt - 1));
      await sleep(wait);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('Graph API request failed');
}

export async function graphGetAllPages<T>(path: string, params: Record<string, string | number | undefined>) {
  const pageSize = typeof params.limit === 'undefined' ? 50 : params.limit;

  let nextUrl: string | null = null;
  let after: string | undefined = undefined;
  const out: T[] = [];

  for (let i = 0; i < 20; i++) {
    const page = nextUrl
      ? await (async () => {
          // When paging.next is present, it already contains access_token.
          const res = await fetch(nextUrl, { cache: 'no-store' });
          const json = (await res.json()) as GraphPage<T>;
          if (!res.ok || (json as any)?.error) {
            const e = (json as any)?.error;
            throw new Error(`Instagram Graph API error (${res.status}): ${e?.message ?? res.statusText}`);
          }
          return json;
        })()
      : await graphGet<GraphPage<T>>(path, { ...params, limit: pageSize, after });

    out.push(...(page.data ?? []));

    nextUrl = page.paging?.next ?? null;
    after = page.paging?.cursors?.after;

    if (!nextUrl) break;
  }

  return out;
}
