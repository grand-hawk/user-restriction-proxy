import { Router } from 'express';
import { TimeoutError } from 'ky';
import { z } from 'zod';

import { env } from '@/env';
import { getUserRestriction } from '@/lib/cloud/getUserRestriction';
import { authorizationMiddleware } from '@/middleware/authorization';
import { log } from '@/pino';
import { redis } from '@/services/redis';

import type { UserRestriction } from '@/lib/cloud/getUserRestriction';

type UserRestrictions = Record<
  string,
  UserRestriction['gameJoinRestriction'] | null
>;

const valueSchema = z.object({
  userRestrictions: z.unknown(),
});

const router = Router();

const paramsSchema = z.object({
  userId: z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number()),
});

router.get(
  '/user-restrictions/:userId',
  authorizationMiddleware,
  async (req, res) => {
    const parsedParams = paramsSchema.safeParse(req.params);
    if (!parsedParams.success)
      return res.status(400).json({
        error: 'Invalid parameters',
        details: parsedParams.error.errors,
      });

    const { userId } = parsedParams.data;

    const cacheKey = `user-restrictions:${userId}`;
    const existing = await redis.get(cacheKey);

    if (existing) {
      const parsed = JSON.parse(existing);
      if (valueSchema.safeParse(parsed).success)
        return res.json(parsed.userRestrictions);
    }

    try {
      const promises = env.UNIVERSE_IDS.map(async (universeId) => {
        let restriction: UserRestrictions[string] = null;

        const startTime = Date.now();
        const tryRequest = async () => {
          try {
            const result = await getUserRestriction(universeId, userId);
            restriction = result ? result.gameJoinRestriction : null;
          } catch (err) {
            const elapsedTime = (Date.now() - startTime) / 1_000;
            if (
              err instanceof TimeoutError &&
              elapsedTime < env.TIMEOUT_BACKOFF
            ) {
              return tryRequest();
            }
          }
        };

        await tryRequest();

        return {
          [universeId]: restriction,
        };
      });

      const settled = await Promise.allSettled(promises);
      const results: UserRestrictions[] = settled
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      const restrictions = results.reduce((acc, result) => {
        if (result) return { ...acc, ...result };
        return acc;
      }, {});

      await redis.set(
        cacheKey,
        JSON.stringify({
          userRestrictions: restrictions,
        } satisfies z.infer<typeof valueSchema>),
      );
      await redis.expire(cacheKey, env.REDIS_EXPIRY);

      res.json(restrictions);
    } catch (err) {
      log.warn(err, `Error fetching user restrictions`);

      res.status(500).json({ error: 'Failed to fetch user restrictions' });
    }
  },
);

export default router;
