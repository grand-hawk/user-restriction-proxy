import { InfisicalSDK } from '@infisical/sdk';

import { env } from '@/env';

export const client = new InfisicalSDK({});

if (env.INFISICAL_SERVICE_TOKEN)
  client.auth().accessToken(env.INFISICAL_SERVICE_TOKEN);

// eslint-disable-next-line import/no-mutable-exports
export let environment: string | undefined = env.INFISICAL_ENVIRONMENT;
if (!environment) {
  if (env.NODE_ENV === 'development') environment = 'dev';
  else if (env.NODE_ENV === 'staging') environment = 'staging';
  else if (env.NODE_ENV === 'production') environment = 'prod';
}
