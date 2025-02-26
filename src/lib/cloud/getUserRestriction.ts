import ky from 'ky';

import { env } from '../../env';

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

export default async function getUserRestriction(universeId: number, userId: number) {
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
