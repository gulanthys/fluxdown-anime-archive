import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const manifestText = await readFile(join(root, 'manifest.json'), 'utf8');
const manifest = JSON.parse(manifestText);
const archiveName = `anime-archive-${manifest.version}.fxplug`;
await rm(dist, { recursive: true, force: true });
await rm(join(root, archiveName), { force: true });
await rm(join(root, `${archiveName}.zip`), { force: true });
await mkdir(dist, { recursive: true });
const parser = await readFile(join(root, 'parser.js'), 'utf8');
const anitomy = await readFile(join(root, 'vendor/anitomy-0.0.35/anitomy.mjs'), 'utf8');
const license = await readFile(join(root, 'vendor/anitomy-0.0.35/LICENSE'), 'utf8');
const attribution = `/*\n * anitomy@0.0.35, https://github.com/yjl9903/anitomy\n * MIT License; bundled from https://registry.npmjs.org/anitomy/-/anitomy-0.0.35.tgz\n${license.split(/\r?\n/).map(line => ` * ${line}`).join('\n')}\n */\n`;
for (const name of ['archive.js', 'main.js']) {
  const source = attribution + anitomy + '\n' + parser + '\n' + await readFile(join(root, name), 'utf8');
  await writeFile(join(dist, name), source);
}
await writeFile(join(dist, 'manifest.json'), manifestText);
const archive = join(root, archiveName);
const tempZip = archive + '.zip';
const zip = spawnSync('powershell.exe', ['-NoProfile', '-Command', `Compress-Archive -Path '${dist}\\\\*' -DestinationPath '${tempZip}' -Force`], { stdio: 'inherit' });
if (zip.status !== 0) throw new Error('Compress-Archive failed');
await (await import('node:fs/promises')).rename(tempZip, archive);
