import { Router } from 'express';
import { z } from 'zod';

import { env } from '../../env';
import getUserRestriction from '../../lib/cloud/getUserRestriction';
import authorization from '../../middleware/authorization';
import { redis } from '../../services/redis';

import type { UserRestriction } from '../../lib/cloud/getUserRestriction';

type UserRestrictions = Record<string, UserRestriction['gameJoinRestriction']>;

const valueSchema = z.object({
  partial: z.boolean(),
  userRestrictions: z.unknown(),
});

const router = Router();

const paramsSchema = z.object({
  userId: z
    .string()
    .transform((v) => Number(v))
    .pipe(z.number()),
});

router.get('/user-restrictions/:userId', authorization, async (req, res) => {
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
    if (valueSchema.safeParse(parsed).success && !parsed.partial)
      return res.json(parsed.userRestrictions);
  }

  try {
    const promises = env.UNIVERSE_IDS.map(async (universeId) => {
      const restriction = await getUserRestriction(universeId, userId);
      if (!restriction) return null;

      return {
        [universeId]: restriction.gameJoinRestriction,
      };
    });

    const settled = await Promise.allSettled(promises);
    const results: UserRestrictions[] = [];
    for (const result of settled) {
      // eslint-disable-next-line default-case
      switch (result.status) {
        case 'fulfilled':
          if (result.value) results.push(result.value);
          break;
        case 'rejected':
          console.warn(`User restriction fetch failed: ${result.reason}`);
          break;
      }
    }

    const restrictions = results.reduce((acc, result) => {
      if (result) return { ...acc, ...result };
      return acc;
    }, {});

    await redis.set(
      cacheKey,
      JSON.stringify({
        partial: promises.length !== results.length,
        userRestrictions: restrictions,
      } satisfies z.infer<typeof valueSchema>),
    );
    await redis.expire(cacheKey, env.REDIS_EXPIRY);

    res.json(restrictions);
  } catch (error) {
    console.warn(`Error fetching user restrictions: ${error}`);

    res.status(500).json({ error: 'Failed to fetch user restrictions' });
  }
});

export default router;
