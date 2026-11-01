import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
await import('../vendor/anitomy-0.0.35/anitomy.mjs');
const { parse, evaluate } = require('../parser.js');
const p = (s, settings) => parse(s, settings)?.folderName ?? null;
test('Chinese episodes and release labels', () => {
  assert.equal(p('凡人修仙传 第12集 [1080p].mkv'), '凡人修仙传');
  assert.equal(p('从零开始的异世界生活 第2季 第03集 [1080p].mkv'), '从零开始的异世界生活');
  assert.equal(p('海贼王 - 01 [1080p].mkv'), '海贼王');
  assert.equal(p('Frieren S02E03 [WEB-DL].mkv'), 'Frieren');
  assert.equal(p('Show 2x03.mkv'), 'Show');
});
test('preserves title digits, rejects software and unknown forms', () => {
  assert.equal(p('86 - 01 [1080p].mkv'), '86');
  assert.equal(p('Some Anime 2024 - 01.mkv'), 'Some Anime 2024');
  assert.equal(p('A random movie title.mkv'), null);
  assert.equal(p('tool-installer.exe'), null);
});
test('ordered override behavior and aliases', () => {
  assert.equal(p('Show S01E01.mkv', { rules: [{ pattern: 'Show', action: 'exclude' }] }), null);
  assert.equal(p('Show S01E01.mkv', { rules: [{ pattern: 'Show', action: 'assign', title: 'Custom' }] }), 'Custom');
  assert.equal(p('Show S01E01.mkv', { aliases: { Show: 'Display' } }), 'Display');
});
test('invalid user configuration reports actionable errors and rules stop at first match', () => {
  assert.throws(() => parse('Show S01E01.mkv', { rules: [{ pattern: '[', action: 'include' }] }), Error);
  assert.throws(() => parse('Show S01E01.mkv', { rules: [{ pattern: 'Show', action: 'assign' }] }), Error);
  assert.equal(p('Show S01E01.mkv', { rules: [{ pattern: 'Show', action: 'include' }, { pattern: 'Show', action: 'assign', title: 'Wrong' }] }), 'Show');
});
test('unknown non-video stays unchanged; metadata drives video grouping and diagnostics', () => {
  assert.equal(p('notes.pdf'), null);
  assert.equal(p('art.webp'), null);
  assert.equal(p('track.flac'), null);
  assert.equal(p('book.epub'), null);
  assert.equal(p('package.zip'), null);
  const metadata = { platform: 'site', mediaKind: 'series', seriesId: '42', seriesTitle: 'Series', creatorId: '7', creatorName: 'Creator', collectionId: '9', collectionTitle: 'Collection' };
  assert.equal(p('clip.mp4', { metadata }), 'Series');
  assert.equal(p('clip.mp4', { metadata, videoGrouping: 'creator' }), 'Creator');
  assert.equal(p('clip.mp4', { metadata, videoGrouping: 'collection' }), 'Collection');
  assert.equal(p('clip', { metadata, isGroup: true }), 'Series');
  assert.equal(p('audio.m4a', { metadata, isGroup: true }), null);
});
test('stable entity aliases, safe folder names and explicit extension override', () => {
  const metadata = { platform: 'site', mediaKind: 'post', creatorId: '12', creatorName: 'Creator' };
  assert.equal(p('clip.mp4', { metadata, aliases: { 'site:creator:12': 'Creator Display' } }), 'Creator Display');
  assert.equal(p('installer.exe', { rules: [{ pattern: 'installer', action: 'assign', title: 'Tools' }] }), 'Tools');
  assert.equal(p('clip.mp4', { rules: [{ pattern: 'clip', action: 'assign', title: 'CON' }] }), null);
});
test('generic ordered rule conditions and capture templates', () => {
  assert.equal(p('Study guide.pdf', { rules: [{ extensions: ['pdf'], all: ['Study'], any: ['guide', 'notes'], not: ['draft'], action: 'assign', title: 'Item $1', pattern: '(Study)' }] }), 'Item Study');
  assert.equal(p('Study draft.pdf', { rules: [{ extensions: ['pdf'], all: ['Study'], not: ['draft'], action: 'assign', title: 'Docs' }] }), null);
  assert.equal(p('Study.pdf', { rules: [{ pattern: 'Study', action: 'assign', title: 'Docs/$1' }] }), null);
});

function classificationView() {
  let definition;
  let rejectWrite = false;
  const settings = { aliases: '{}', rules: '[]', videoGrouping: 'auto' };
  const context = vm.createContext({
    flux: {
      settings: { ...settings, update: async patch => {
        if (rejectWrite) throw new Error('settings storage unavailable');
        Object.assign(settings, patch);
      } },
      ui: { view: (_name, view) => { definition = view; } },
    },
  });
  for (const path of ['../vendor/anitomy-0.0.35/anitomy.mjs', '../parser.js', '../main.js']) {
    vm.runInContext(readFileSync(new URL(path, import.meta.url), 'utf8'), context);
  }
  const state = definition.init();
  const send = (node, type, value) => definition.event(state, { node: 'root/' + node, type, value }, { refresh() {} });
  return { state, send, rejectWrites() { rejectWrite = true; } };
}

test('saved grouping choices immediately change the preview without reopening the view', async () => {
  const view = classificationView();
  await view.send('source-metadata', 'change', JSON.stringify({
    platform: 'site', mediaKind: 'post', creatorId: '42', creatorName: 'Chosen Creator',
    collectionId: '9', collectionTitle: 'Chosen Collection',
  }));
  await view.send('filename', 'change', 'clip.mp4');
  assert.match(view.state.preview, /Chosen Creator/);
  await view.send('video-grouping', 'change', 'collection');
  assert.match(view.state.preview, /Chosen Collection/);
  await view.send('video-grouping', 'change', 'creator');
  assert.match(view.state.preview, /Chosen Creator/);
});

test('failed alias persistence cannot alter the displayed or effective saved rule', async () => {
  const view = classificationView();
  await view.send('source-metadata', 'change', JSON.stringify({
    platform: 'site', mediaKind: 'post', creatorId: '42', creatorName: 'Original Creator',
  }));
  await view.send('filename', 'change', 'clip.mp4');
  await view.send('alias-source', 'change', 'site:creator:42');
  await view.send('alias-target', 'change', 'Saved Name');
  await view.send('save-alias', 'press');
  assert.match(view.state.preview, /Saved Name/);
  view.rejectWrites();
  await view.send('alias-target', 'change', 'Unsaved Name');
  await view.send('save-alias', 'press');
  assert.equal(view.state.aliases[0].to, 'Saved Name');
  await view.send('filename', 'change', 'next.mp4');
  assert.match(view.state.preview, /Saved Name/);
  assert.doesNotMatch(view.state.preview, /Unsaved Name/);
});
