import { Router } from 'express';
import { z } from 'zod';

import { env } from '../../env';
import getUserRestriction from '../../lib/cloud/getUserRestriction';
import authorization from '../../middleware/authorization';
import { redis } from '../../services/redis';

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
  if (existing) return res.json(JSON.parse(existing));

  try {
    const promises = env.UNIVERSE_IDS.map(async (universeId) => {
      const restriction = await getUserRestriction(universeId, userId);
      if (!restriction) return null;

      return {
        [universeId]: restriction.gameJoinRestriction,
      };
    });

    const results = await Promise.all(promises);

    const restrictions = results.reduce((acc, result) => {
      if (result) return { ...acc, ...result };
      return acc;
    }, {});

    await redis.set(cacheKey, JSON.stringify(restrictions));
    await redis.expire(cacheKey, env.REDIS_EXPIRY);

    res.json(restrictions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user restrictions' });
  }
});

export default router;
