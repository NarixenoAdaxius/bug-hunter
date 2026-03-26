import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const getBindings = require('bindings');

/** @type {{ scanStats: (code: string) => { byteLength: number; lineCount: number } }} */
let addon;
try {
  addon = getBindings({ bindings: 'cpp_engine', module_root: __dirname });
} catch (err) {
  throw new Error(
    'Bug Hunter native addon not built. From the repo root run: npm run build -w @bughunter/cpp-engine',
    { cause: err }
  );
}

/**
 * Fast buffer stats for large-file scanning (native stub; deeper analysis will extend this API).
 * @param {string} code
 * @returns {{ byteLength: number; lineCount: number }}
 */
export function scanStats(code) {
  return addon.scanStats(code);
}
