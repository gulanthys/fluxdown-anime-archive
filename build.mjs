import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await rm(join(root, 'anime-archive-1.0.0.fxplug'), { force: true });
await rm(join(root, 'anime-archive-1.0.0.fxplug.zip'), { force: true });
await mkdir(dist, { recursive: true });
const parser = await readFile(join(root, 'parser.js'), 'utf8');
for (const name of ['archive.js', 'main.js']) {
  const source = parser + '\n' + await readFile(join(root, name), 'utf8');
  await writeFile(join(dist, name), source);
}
await writeFile(join(dist, 'manifest.json'), await readFile(join(root, 'manifest.json')));
const archive = join(root, 'anime-archive-1.0.0.fxplug');
const tempZip = archive + '.zip';
const zip = spawnSync('powershell.exe', ['-NoProfile', '-Command', `Compress-Archive -Path '${dist}\\\\*' -DestinationPath '${tempZip}' -Force`], { stdio: 'inherit' });
if (zip.status !== 0) throw new Error('Compress-Archive failed');
await (await import('node:fs/promises')).rename(tempZip, archive);
