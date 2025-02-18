import { platform } from 'node:os';

export default function importPath(path: string) {
  // https://nodejs.org/api/errors.html#err_unsupported_esm_url_scheme
  return platform() === 'win32' ? `file://${path}` : path;
}
