import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
await import('../vendor/anitomy-0.0.35/anitomy.mjs');
const { parse, evaluate, validate } = require('../parser.js');
const bilibili = { platform: 'bilibili', mediaKind: 'post', creatorId: '3707002469485044', creatorName: '小猪仔步履不停', collectionId: '8878655', collectionTitle: '小猪仔评财报' };
const filename = '【小猪仔】NBV单季度-54.1%，发生了啥？.mp4';
const destination = (name, settings) => { const result = parse(name, settings); return result?.directories || (result?.folderName ? [result.folderName] : null); };

test('Bilibili source facts create the agreed hierarchy without renaming the file', () => {
  assert.deepEqual(destination(filename, { metadata: bilibili }), ['视频', '哔哩哔哩', '小猪仔步履不停', '小猪仔评财报']);
  assert.deepEqual(destination(filename, { metadata: { ...bilibili, collectionTitle: '' } }), ['视频', '哔哩哔哩', '小猪仔步履不停']);
  assert.deepEqual(destination(filename, { metadata: { ...bilibili, platform: 'youtube' } }), ['视频', 'YouTube', '小猪仔步履不停', '小猪仔评财报']);
});
test('series source identity supports extensionless groups; unrelated file types are not treated as video', () => {
  const metadata = { platform: 'bilibili', mediaKind: 'series', seriesId: '42', seriesTitle: '葬送的芙莉莲' };
  assert.deepEqual(destination('合集', { metadata, isGroup: true }), ['视频', '哔哩哔哩', '葬送的芙莉莲']);
  assert.deepEqual(destination('audio.m4a', { metadata }), ['音乐']);
  assert.deepEqual(destination('notes.pdf', { metadata }), ['文档']);
});
test('episode parsing preserves title digits and aliases while common types and unknowns stay distinct', () => {
  for (const [name, title] of [['凡人修仙传 第12集 [1080p].mkv', '凡人修仙传'], ['Frieren S02E03 [WEB-DL].mkv', 'Frieren'], ['86 - 01 [1080p].mkv', '86'], ['Some Anime 2024 - 01.mkv', 'Some Anime 2024']]) {
    assert.deepEqual(destination(name), ['视频', title]);
  }
  assert.deepEqual(destination('Show S01E01.mkv', { aliases: { Show: 'Display' } }), ['视频', 'Display']);
  for (const [name, folder] of [['book.epub', '书籍'], ['art.webp', '图片'], ['track.flac', '音乐'], ['archive.7z', '压缩包'], ['installer.exe', '软件']]) assert.deepEqual(destination(name), [folder]);
  assert.equal(parse('opaque-download'), null);
  assert.equal(parse('unknown.qwerty'), null);
});
test('personal ordered filename rules override source and built-in rules', () => {
  assert.equal(parse(filename, { metadata: bilibili, rules: [{ extensions: ['mp4'], action: 'exclude' }] }), null);
  assert.deepEqual(destination('Study guide.pdf', { rules: [{ extensions: ['pdf'], all: ['Study'], any: ['guide', 'notes'], not: ['draft'], pattern: '(Study)', action: 'assign', title: 'Item $1' }] }), ['Item Study']);
  assert.equal(parse('Study.pdf', { rules: [{ pattern: 'Study', action: 'assign', title: 'Docs/$1' }] }), null);
  assert.throws(() => validate({ rules: [{ pattern: '[', action: 'include' }] }), /regex/);
});
test('stable entity aliases and hostile metadata cannot become directory traversal', () => {
  assert.deepEqual(destination(filename, { metadata: bilibili, aliases: { 'bilibili:creator:3707002469485044': '收藏作者' } }), ['视频', '哔哩哔哩', '收藏作者', '小猪仔评财报']);
  const result = destination(filename, { metadata: { ...bilibili, creatorName: '../../evil\\name', collectionTitle: 'x:y' } });
  assert.ok(result.every(part => !/[\\/:]/.test(part) && part !== '.' && part !== '..'));
  const reserved = destination(filename, { metadata: { ...bilibili, creatorName: 'CON' } });
  assert.ok(!reserved.includes('CON'));
});
test('directory preview and callback both reject paths beyond the host byte limit', () => {
  const metadata = { ...bilibili, creatorName: '作'.repeat(40), collectionTitle: '集'.repeat(40) };
  assert.equal(parse(filename, { metadata }), null);
  assert.match(evaluate(filename, { metadata }).reason, /180 UTF-8 bytes/);
});
const custom = (when, directories) => ({ version: 1, classifiers: [], layouts: [{ id: 'personal', when, directories }] });
test('custom layouts support recursive predicates, unicode glob, and explicit missing policies', () => {
  const ruleDocument = custom({ all: [{ field: 'platform', equals: 'bilibili' }, { any: [{ field: 'fileName', glob: '*发生了啥？.MP4' }, { field: 'extension', in: ['mkv'] }] }, { not: { field: 'creatorName', equals: 'Excluded' } }] }, [{ text: '收藏' }, { field: 'creatorName' }, { field: 'seriesTitle', onMissing: 'omit' }, { field: 'collectionTitle', onMissing: 'fallback', fallback: '单篇' }]);
  assert.deepEqual(destination(filename, { metadata: { ...bilibili, collectionTitle: '' }, ruleDocument }), ['收藏', '小猪仔步履不停', '单篇']);
  assert.equal(parse('other.mp4', { metadata: bilibili, ruleDocument: custom({ field: 'fileName', glob: '*.pdf' }, [{ text: 'Docs' }]) })?.directories?.[0], undefined);
});
test('malformed documents, unknown fields, excessive nesting and unsafe literals are rejected before use', () => {
  assert.throws(() => validate({ ruleDocument: '{' }), /JSON/);
  assert.throws(() => validate({ ruleDocument: { version: 9, classifiers: [], layouts: [] } }), /version/);
  assert.throws(() => validate({ ruleDocument: custom({ field: '__proto__', exists: true }, [{ text: 'Docs' }]) }), /field/);
  for (const text of ['../escape', 'C:\\outside', '..', 'CON', 'trailing.']) assert.throws(() => validate({ ruleDocument: custom({ field: 'extension', equals: 'pdf' }, [{ text }]) }), /Unsafe/);
  let when = { field: 'extension', equals: 'pdf' };
  for (let i = 0; i < 10; i++) when = { not: when };
  assert.throws(() => validate({ ruleDocument: custom(when, [{ text: 'Docs' }]) }), /nesting/);
  assert.throws(() => validate({ ruleDocument: custom({ field: 'extension', exists: 'yes' }, [{ text: 'Docs' }]) }), /boolean/);
  assert.throws(() => validate({ ruleDocument: custom({ field: 'extension', equals: 'pdf' }, Array.from({ length: 9 }, () => ({ text: 'Docs' }))) }), /1 to 8/);
});
function classificationView() {
  let definition, rejectWrite = false;
  const writes = [];
  const context = vm.createContext({ flux: { settings: { aliases: '{}', rules: '[]', videoGrouping: 'auto', ruleDocument: '', update: async patch => { if (rejectWrite) throw new Error('settings storage unavailable'); writes.push(patch); } }, ui: { view: (_name, view) => { definition = view; } } } });
  vm.runInContext('globalThis.AnimeArchiveSeedRules = ' + readFileSync(new URL('../rules.json', import.meta.url), 'utf8'), context);
  for (const path of ['../vendor/anitomy-0.0.35/anitomy.mjs', '../classifier.js', '../parser.js', '../main.js']) vm.runInContext(readFileSync(new URL(path, import.meta.url), 'utf8'), context);
  const state = definition.init();
  const send = (node, type, value) => definition.event(state, { node: 'root/' + node, type, value }, { refresh() {} });
  return { state, send, writes, rejectWrites() { rejectWrite = true; } };
}
test('portable view saves validated rules and uses the confirmed configuration in preview', async () => {
  const view = classificationView();
  await view.send('source-metadata', 'change', JSON.stringify(bilibili));
  await view.send('filename', 'change', filename);
  assert.match(view.state.preview, /视频 \/ 哔哩哔哩 \/ 小猪仔步履不停 \/ 小猪仔评财报/);
  const doc = JSON.stringify(custom({ field: 'platform', equals: 'bilibili' }, [{ text: '我的收藏' }, { field: 'creatorName' }]));
  await view.send('rule-document', 'change', doc);
  await view.send('save-document', 'press');
  assert.match(view.state.preview, /我的收藏 \/ 小猪仔步履不停/);
  assert.equal(view.writes.at(-1).ruleDocument, doc);
  view.rejectWrites();
  await view.send('rule-document', 'change', JSON.stringify(custom({ field: 'platform', equals: 'bilibili' }, [{ text: '不应生效' }])));
  await view.send('save-document', 'press');
  assert.match(view.state.error, /storage unavailable/);
  await view.send('filename', 'change', filename);
  assert.match(view.state.preview, /我的收藏/);
  assert.doesNotMatch(view.state.preview, /不应生效/);
});
test('invalid editor content never reaches settings storage', async () => {
  const view = classificationView();
  await view.send('rule-document', 'change', '{');
  await view.send('save-document', 'press');
  assert.match(view.state.error, /JSON/);
  assert.equal(view.writes.length, 0);
  await view.send('reset-document', 'press');
  assert.equal(view.writes.at(-1).ruleDocument, '');
});
