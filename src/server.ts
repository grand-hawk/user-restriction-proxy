import path from 'node:path';

import express from 'express';
import klaw from 'klaw';

import { env } from '@/env';
import { log } from '@/pino';
import { importPath } from '@/utils/importPath';

import type { Router } from 'express';

const app = express();

app.use(express.json());

const routesDirectory = 'dist/routes';
for await (const file of klaw(routesDirectory)) {
  file.path = file.path.replaceAll('\\', '/');

  if (!file.path.endsWith('.js')) continue;

  const segments = file.path.split(routesDirectory);
  const parent = segments[1] ? path.dirname(segments[1]) : '/';

  const router: { default: Router } = await import(importPath(file.path));

  app.use(parent, router.default);
}

app.listen(env.PORT, '0.0.0.0', () =>
  log.info(`Server listening on 0.0.0.0:${env.PORT}`),
);
