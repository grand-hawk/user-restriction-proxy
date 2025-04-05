import path from 'node:path';

import { env } from '@/env';
import { log } from '@/pino';
import { client, environment } from '@/services/infisical';

import type { NextFunction, Request, Response } from 'express';

let { AUTHORIZATION } = env;

if (
  !AUTHORIZATION &&
  env.INFISICAL_WORKSPACE_ID &&
  env.INFISICAL_SERVICE_TOKEN &&
  env.AUTHORIZATION_INFISICAL_SECRET_PATH
) {
  if (!environment)
    throw new Error('Could not determine Infisical environment');

  client.auth().accessToken(env.INFISICAL_SERVICE_TOKEN);

  const secret = await client.secrets().getSecret({
    environment,
    projectId: env.INFISICAL_WORKSPACE_ID,
    secretPath: path.dirname(env.AUTHORIZATION_INFISICAL_SECRET_PATH),
    secretName: path.basename(env.AUTHORIZATION_INFISICAL_SECRET_PATH),
  });

  log.info(
    {
      ...secret,
      secretValue: 'hidden',
    },
    'Fetched Infisical secret',
  );

  AUTHORIZATION = secret.secretValue;
}

export function authorizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!AUTHORIZATION) return next();

  if (req.headers.authorization !== `Basic ${AUTHORIZATION}`)
    return res.status(401).json({ error: 'Unauthorized' });

  next();
}
