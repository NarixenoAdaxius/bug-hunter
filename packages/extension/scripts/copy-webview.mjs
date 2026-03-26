import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(__dirname, '..');
const webviewDist = path.resolve(extensionRoot, '../webview/dist');
const dest = path.join(extensionRoot, 'media', 'webview');

if (!fs.existsSync(webviewDist)) {
  console.error('Webview dist not found. Build @bughunter/webview first:', webviewDist);
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(webviewDist, dest, { recursive: true });
console.log('Copied webview build to', dest);
