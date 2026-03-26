import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.join(__dirname, '..');
const repoRoot = path.join(extensionRoot, '..', '..');

const pkg = JSON.parse(fs.readFileSync(path.join(extensionRoot, 'package.json'), 'utf8'));
const outVsix = path.join(repoRoot, `bug-hunter-${pkg.version}.vsix`);

const result = spawnSync(
  'npm',
  ['exec', '--', 'vsce', 'package', '--no-dependencies', '-o', outVsix],
  { stdio: 'inherit', cwd: extensionRoot, shell: true }
);

process.exit(result.status ?? 1);
