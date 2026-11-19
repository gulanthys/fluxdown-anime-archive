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
const seedRules = await readFile(join(root, 'rules.json'), 'utf8');
JSON.parse(seedRules);
const seed = `globalThis.AnimeArchiveSeedRules = ${seedRules};\n`;
const parser = await readFile(join(root, 'parser.js'), 'utf8');
const classifier = await readFile(join(root, 'classifier.js'), 'utf8');
const entry = await readFile(join(root, 'archive.js'), 'utf8');
await writeFile(join(dist, 'archive.js'), seed + classifier + '\n' + parser + '\n' + entry);
await writeFile(join(dist, 'manifest.json'), manifestText);
const archive = join(root, archiveName);
const tempZip = archive + '.zip';
const psQuote = value => `'${value.replace(/'/g, "''")}'`;
const platformZip = process.platform === 'win32'
  ? spawnSync('powershell.exe', ['-NoProfile', '-Command', `Compress-Archive -Path ${psQuote(join(dist, '*'))} -DestinationPath ${psQuote(tempZip)} -Force`], { stdio: 'inherit' })
  : spawnSync('zip', ['-q', '-r', tempZip, '.'], { cwd: dist, stdio: 'inherit' });
if (platformZip.status !== 0) throw new Error('Plugin archive compression failed');
await (await import('node:fs/promises')).rename(tempZip, archive);
