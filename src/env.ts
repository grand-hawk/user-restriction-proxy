import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'staging', 'production'])
      .default('production'),

    HOSTNAME: z.string().default('0.0.0.0'),
    PORT: z
      .string()
      .default('3000')
      .transform((v) => parseInt(v, 10))
      .pipe(z.number()),
    AUTHORIZATION_HEADER: z.string().optional(),

    REDIS: z.string().url().default('redis://localhost:6379'),
    REDIS_EXPIRY: z
      .string()
      .default('3600')
      .transform((v) => parseInt(v, 10))
      .pipe(z.number()),

    UNIVERSE_IDS: z
      .string()
      .default('')
      .transform((v) => v.split(','))
      .transform((v) => v.map((v2) => Number(v2)))
      .pipe(z.number().array()),
    API_KEY: z.string(),
    TIMEOUT_BACKOFF: z
      .string()
      .default('30')
      .transform((v) => parseInt(v, 10))
      .pipe(z.number()),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
