import { getDb } from '@/lib/db';
import { getInstagramEnv } from '@/lib/env';
import { graphGet, graphGetAllPages } from './ig-graph';

type GraphInsight = {
  name: string;
  period?: string;
  values: Array<{ value: number | string; end_time?: string }>;
  title?: string;
  description?: string;
  id?: string;
};

type IgUser = {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
};

type IgMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

function toDateOnly(iso: string) {
  // end_time is ISO; store as YYYY-MM-DD (UTC).
  return iso.slice(0, 10);
}

function coerceNumber(v: number | string | undefined | null): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type InstagramSyncResult = {
  runId: number;
  igUserId: string;
  fetchedMedia: number;
  fetchedMediaInsightsRows: number;
  fetchedAccountInsightRows: number;
};

/**
 * Runs a single sync into SQLite.
 *
 * What we fetch:
 * - IG account basic fields (username, followers_count, etc.)
 * - Recent media (last ~50)
 * - Daily account insights for last 7 days (reach, impressions, profile_views when available)
 * - Media insights for each media item (metrics vary by type; we try a safe set)
 */
export async function runInstagramSync(): Promise<InstagramSyncResult> {
  const env = getInstagramEnv();
  const db = getDb();

  const run = db
    .prepare(
      `INSERT INTO ig_sync_runs (started_at, status, error_message, meta)
       VALUES (datetime('now'), 'running', NULL, ?)`
    )
    .run(JSON.stringify({ apiVersion: env.IG_API_VERSION }));

  const runId = Number(run.lastInsertRowid);

  try {
    // 1) Account
    const account = await graphGet<IgUser>(`/${env.IG_USER_ID}`, {
      fields: [
        'id',
        'username',
        'name',
        'profile_picture_url',
        'followers_count',
        'media_count',
      ].join(','),
    });

    db.prepare(
      `INSERT INTO ig_accounts (
        ig_user_id, username, name, profile_picture_url, followers_count, media_count, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(ig_user_id) DO UPDATE SET
        username=excluded.username,
        name=excluded.name,
        profile_picture_url=excluded.profile_picture_url,
        followers_count=excluded.followers_count,
        media_count=excluded.media_count,
        updated_at=datetime('now')`
    ).run(
      env.IG_USER_ID,
      account.username ?? null,
      account.name ?? null,
      account.profile_picture_url ?? null,
      account.followers_count ?? null,
      account.media_count ?? null
    );

    // 2) Recent media
    const media = await graphGetAllPages<IgMedia>(`/${env.IG_USER_ID}/media`, {
      fields: [
        'id',
        'caption',
        'media_type',
        'media_url',
        'permalink',
        'thumbnail_url',
        'timestamp',
        'like_count',
        'comments_count',
      ].join(','),
      limit: 50,
    });

    const upsertMedia = db.prepare(
      `INSERT INTO ig_media (
        id, ig_user_id, caption, media_type, media_url, permalink, thumbnail_url, timestamp,
        like_count, comments_count, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        ig_user_id=excluded.ig_user_id,
        caption=excluded.caption,
        media_type=excluded.media_type,
        media_url=excluded.media_url,
        permalink=excluded.permalink,
        thumbnail_url=excluded.thumbnail_url,
        timestamp=excluded.timestamp,
        like_count=excluded.like_count,
        comments_count=excluded.comments_count,
        updated_at=datetime('now')`
    );

    db.transaction(() => {
      for (const m of media) {
        upsertMedia.run(
          m.id,
          env.IG_USER_ID,
          m.caption ?? null,
          m.media_type ?? null,
          m.media_url ?? null,
          m.permalink ?? null,
          m.thumbnail_url ?? null,
          m.timestamp ?? null,
          m.like_count ?? null,
          m.comments_count ?? null
        );
      }
    })();

    // 3) Account daily insights (7d)
    // Some accounts may not have all metrics available; call per metric to be resilient.
    const accountMetrics = ['reach', 'impressions', 'profile_views'];
    let fetchedAccountInsightRows = 0;

    const upsertAccInsight = db.prepare(
      `INSERT INTO ig_daily_account_insights (ig_user_id, metric, date, value, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(ig_user_id, metric, date) DO UPDATE SET
         value=excluded.value,
         updated_at=datetime('now')`
    );

    for (const metric of accountMetrics) {
      try {
        const resp = await graphGet<{ data: GraphInsight[] }>(`/${env.IG_USER_ID}/insights`, {
          metric,
          period: 'day',
          since: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7,
          until: Math.floor(Date.now() / 1000),
        });

        const insights = resp.data ?? [];
        for (const ins of insights) {
          for (const v of ins.values ?? []) {
            if (!v.end_time) continue;
            const value = coerceNumber(v.value);
            if (value === null) continue;
            const date = toDateOnly(v.end_time);
            upsertAccInsight.run(env.IG_USER_ID, ins.name, date, value);
            fetchedAccountInsightRows += 1;
          }
        }
      } catch {
        // ignore missing metric errors; leave note in meta only via sync run.
      }
    }

    // 4) Media insights
    // Metrics differ for REELS/VIDEO/IMAGE/CAROUSEL. We try a conservative set.
    const mediaMetricCandidates = [
      'impressions',
      'reach',
      'engagement',
      'saved',
      'video_views',
      'plays',
      'total_interactions',
    ];

    const upsertMediaInsight = db.prepare(
      `INSERT INTO ig_media_insights (media_id, metric, date, value, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(media_id, metric, date) DO UPDATE SET
         value=excluded.value,
         updated_at=datetime('now')`
    );

    let fetchedMediaInsightsRows = 0;

    for (const m of media) {
      try {
        // Request as many metrics as possible in one call; Meta will error if invalid.
        // So we fallback to trying metrics individually.
        const batch = async (metrics: string[]) =>
          graphGet<{ data: GraphInsight[] }>(`/${m.id}/insights`, {
            metric: metrics.join(','),
            period: 'day',
          });

        let data: GraphInsight[] | null = null;
        try {
          const resp = await batch(mediaMetricCandidates);
          data = resp.data ?? [];
        } catch {
          data = [];
          for (const metric of mediaMetricCandidates) {
            try {
              const resp = await batch([metric]);
              data.push(...(resp.data ?? []));
            } catch {
              // ignore
            }
          }
        }

        for (const ins of data) {
          for (const v of ins.values ?? []) {
            const value = coerceNumber(v.value);
            if (value === null) continue;
            const date = v.end_time ? toDateOnly(v.end_time) : toDateOnly(new Date().toISOString());
            upsertMediaInsight.run(m.id, ins.name, date, value);
            fetchedMediaInsightsRows += 1;
          }
        }
      } catch {
        // ignore per-media insight failures
      }
    }

    db.prepare(
      `UPDATE ig_sync_runs
       SET finished_at=datetime('now'), status='success', error_message=NULL, meta=?
       WHERE id = ?`
    ).run(
      JSON.stringify({
        apiVersion: env.IG_API_VERSION,
        fetchedMedia: media.length,
        fetchedMediaInsightsRows,
        fetchedAccountInsightRows,
      }),
      runId
    );

    return {
      runId,
      igUserId: env.IG_USER_ID,
      fetchedMedia: media.length,
      fetchedMediaInsightsRows,
      fetchedAccountInsightRows,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    db.prepare(
      `UPDATE ig_sync_runs
       SET finished_at=datetime('now'), status='error', error_message=?, meta=?
       WHERE id = ?`
    ).run(
      message,
      JSON.stringify({ apiVersion: env.IG_API_VERSION, error: message }),
      runId
    );

    throw e;
  }
}
