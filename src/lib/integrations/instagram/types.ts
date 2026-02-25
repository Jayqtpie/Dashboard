export type IgAccountRow = {
  ig_user_id: string;
  username: string | null;
  name: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  media_count: number | null;
  updated_at: string;
};

export type IgMediaRow = {
  id: string; // media id
  ig_user_id: string;
  caption: string | null;
  media_type: string | null;
  media_url: string | null;
  permalink: string | null;
  thumbnail_url: string | null;
  timestamp: string | null;
  like_count: number | null;
  comments_count: number | null;
  updated_at: string;
};

export type IgInsightRow = {
  media_id: string;
  metric: string;
  date: string; // YYYY-MM-DD
  value: number;
  updated_at: string;
};

export type IgDailyAccountInsightRow = {
  ig_user_id: string;
  metric: string;
  date: string; // YYYY-MM-DD
  value: number;
  updated_at: string;
};

export type IgSyncRunRow = {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'success' | 'error' | string;
  error_message: string | null;
  meta: string | null; // JSON string
};
