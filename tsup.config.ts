// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**'],
  sourcemap: false,
  format: 'esm',
  treeshake: true,
  noExternal: [/.*/],
});
