import path from 'node:path';

import express from 'express';
import klaw from 'klaw';

import { env } from './env';
import importPath from './utils/importPath';

const app = express();

const routesDirectory =
  process.env.NODE_ENV === 'production' ? 'routes' : 'src/routes';
for await (const file of klaw(routesDirectory)) {
  file.path = file.path.replaceAll('\\', '/');

  if (!file.path.endsWith('.ts') && !file.path.endsWith('.js')) continue;

  const segments = file.path.split(routesDirectory);
  const parent = segments[1] ? path.dirname(segments[1]) : '/';

  const router = await import(importPath(file.path));

  app.use(parent, router.default);
}

app.listen(env.PORT, env.HOSTNAME, () =>
  console.log(`Listening on ${env.HOSTNAME}:${env.PORT}`),
);
