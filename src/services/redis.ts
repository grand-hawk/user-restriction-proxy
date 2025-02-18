import Redis from 'ioredis';

import { env } from '../env';

// eslint-disable-next-line import/prefer-default-export
export const redis = new Redis(env.REDIS);
