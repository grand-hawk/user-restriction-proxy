import { env } from '../env';

import type { NextFunction, Request, Response } from 'express';

export default function authorization(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!env.AUTHORIZATION_HEADER) return next();

  if (req.headers.authorization !== env.AUTHORIZATION_HEADER)
    return res.status(401).json({ error: 'Unauthorized' });

  next();
}
