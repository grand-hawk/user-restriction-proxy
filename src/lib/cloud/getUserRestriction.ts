import path from 'node:path';

import ky from 'ky';

import { env } from '@/env';
import { log } from '@/pino';
import { client, environment } from '@/services/infisical';

let { API_KEY } = env;

if (
  !API_KEY &&
  env.INFISICAL_WORKSPACE_ID &&
  env.API_KEY_INFISICAL_SECRET_PATH
) {
  if (!environment)
    throw new Error('Could not determine Infisical environment');

  const secret = await client.secrets().getSecret({
    environment,
    projectId: env.INFISICAL_WORKSPACE_ID,
    secretPath: path.dirname(env.API_KEY_INFISICAL_SECRET_PATH),
    secretName: path.basename(env.API_KEY_INFISICAL_SECRET_PATH),
  });

  log.info(
    {
      ...secret,
      secretValue: 'hidden',
    },
    'Fetched Infisical api key secret',
  );

  API_KEY = secret.secretValue;
}

export interface UserRestriction {
  path: string;
  updateTime?: string;
  user: string;
  gameJoinRestriction: {
    active: boolean;
    startTime?: string;
    duration?: string;
    privateReason: string | '';
    displayReason: string | '';
    excludeAltAccounts: boolean;
    inherited: boolean;
  };
}

export async function getUserRestriction(universeId: number, userId: number) {
  const response = await ky.get(
    `https://apis.roblox.com/cloud/v2/universes/${universeId}/user-restrictions/${userId}`,
    {
      headers: { 'x-api-key': `${env.API_KEY}` },
      throwHttpErrors: false,
      retry: 5,
    },
  );

  if (!response.ok) return null;

  return response.json<UserRestriction>();
}
