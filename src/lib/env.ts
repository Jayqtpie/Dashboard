import { z } from 'zod';

/**
 * Server-only environment validation.
 *
 * NOTE: Do not import this file from client components.
 */

export const InstagramEnvSchema = z.object({
  META_APP_ID: z.string().min(1, 'META_APP_ID is required'),
  META_APP_SECRET: z.string().min(1, 'META_APP_SECRET is required'),
  IG_USER_ID: z.string().min(1, 'IG_USER_ID is required'),
  IG_ACCESS_TOKEN: z.string().min(1, 'IG_ACCESS_TOKEN is required (long-lived token)'),
  IG_API_VERSION: z.string().min(1).default('v22.0'),
});

export type InstagramEnv = z.infer<typeof InstagramEnvSchema>;

export function getInstagramEnv(): InstagramEnv {
  // Ensure default works even if env var is undefined.
  const raw = {
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    IG_USER_ID: process.env.IG_USER_ID,
    IG_ACCESS_TOKEN: process.env.IG_ACCESS_TOKEN,
    IG_API_VERSION: process.env.IG_API_VERSION ?? 'v22.0',
  };
  return InstagramEnvSchema.parse(raw);
}
