import path from 'node:path';

import { env } from '@/env';
import { log } from '@/pino';
import { client as Infisical, environment } from '@/services/infisical';

import type { NextFunction, Request, Response } from 'express';

let { AUTHORIZATION } = env;

if (
  !AUTHORIZATION &&
  env.INFISICAL_WORKSPACE_ID &&
  env.AUTHORIZATION_INFISICAL_SECRET_PATH
) {
  if (!environment)
    throw new Error('Could not determine Infisical environment');

  const secret = await Infisical.secrets().getSecret({
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
    'Fetched Infisical authorization secret',
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
