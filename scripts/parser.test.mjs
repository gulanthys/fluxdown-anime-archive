import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const { parse } = require('../parser.js');
const image = { kind: 'image', mime: 'image/png', extension: 'png' };
const completed = (patch = {}) => ({ fileName: 'photo.txt', phase: 'complete', createdDate: '2026-11-14', ...patch });

test('missing or unsupported content never falls back to filenames or source metadata', () => {
  for (const fileName of ['photo.png', 'book.epub', 'archive.zip', 'Show S01E01.mkv', 'no-extension']) {
    for (const detectedType of [undefined, null, { kind: 'other', mime: 'application/octet-stream', extension: 'bin' }]) {
      assert.equal(parse(completed({
        fileName, detectedType,
        metadata: { platform: 'bilibili', mediaKind: 'series', seriesTitle: 'Series', creatorName: 'Creator' }
      })), null);
    }
  }
});
test('detected content alone determines the stable built-in category id', () => {
  const cases = [
    ['video', 'video/mp4', 'mp4', 'video'],
    ['document', 'application/pdf', 'pdf', 'document'],
    ['presentation', 'application/vnd.ms-powerpoint', 'ppt', 'document'],
    ['spreadsheet', 'application/vnd.ms-excel', 'xls', 'document'],
    ['formula', 'application/vnd.oasis.opendocument.formula', 'odf', 'document'],
    ['subtitle', 'application/x-subrip', 'srt', 'document'],
    ['image', 'image/png', 'png', 'image'],
    ['audio', 'audio/flac', 'flac', 'audio'],
    ['ebook', 'application/epub+zip', 'epub', 'document'],
    ['archive', 'application/zip', 'zip', 'archive'],
    ['compressed', 'application/gzip', 'gz', 'archive'],
    ['executable', 'application/x-executable', 'elf', 'program'],
    ['package', 'application/vnd.android.package-archive', 'apk', 'program'],
    ['other', 'text/plain', 'txt', 'document']
  ];
  for (const [kind, mime, extension, category] of cases) {
    for (const fileName of ['wrong.txt', 'Show S01E01.mkv', 'no-extension']) {
      assert.deepEqual(parse(completed({
        fileName, detectedType: { kind, mime, extension },
        metadata: { platform: 'bilibili', mediaKind: 'series', seriesTitle: '../../Series' }
      })), { category });
    }
  }
});
test('obsolete personal settings cannot change content classification', () => {
  const context = completed({
    detectedType: image, rules: '[', ruleDocument: '{', aliases: '{', videoGrouping: 'invalid',
    metadata: { platform: 'bilibili', creatorName: '../../evil', collectionTitle: 'CON' }
  });
  assert.deepEqual(parse(context), { category: 'image' });
  assert.equal(parse({ ...context, detectedType: null }), null);
});
test('archive callbacks defer files and leave groups unchanged even with supplied content', () => {
  const settings = {};
  const context = vm.createContext({ flux: { settings } });
  vm.runInContext('globalThis.AnimeArchiveSeedRules = ' + readFileSync(new URL('../rules.json', import.meta.url), 'utf8'), context);
  for (const path of ['../classifier.js', '../parser.js', '../archive.js']) vm.runInContext(readFileSync(new URL(path, import.meta.url), 'utf8'), context);
  const invoke = patch => {
    context.input = { ...completed(patch), categoryRouting: true };
    return vm.runInContext('archive(input)', context);
  };
  assert.equal(invoke({ phase: 'start', detectedType: image }), null);
  assert.deepEqual({ ...invoke({ detectedType: image }) }, { category: 'image' });
  for (const phase of ['start', 'complete']) assert.equal(invoke({ phase, isGroup: true, detectedType: image }), null);
  assert.equal(invoke({ detectedType: null }), null);
  for (const [mode, expected] of [
    ['category', { category: 'image' }],
    ['day', { dateBucket: 'day' }],
    ['month', { dateBucket: 'month' }],
    ['category-day', { category: 'image', dateBucket: 'day' }],
    ['category-month', { category: 'image', dateBucket: 'month' }],
  ]) {
    settings.archiveMode = mode;
    assert.deepEqual({ ...invoke({ detectedType: image, completedDate: '2026-07-31' }) }, expected);
    assert.deepEqual({ ...invoke({ detectedType: image }) }, { category: 'image' });
    assert.equal(invoke({ phase: 'start', completedDate: '2026-07-31' }), null);
    assert.equal(invoke({ isGroup: true, completedDate: '2026-07-31' }), null);
  }
  assert.deepEqual({ ...invoke({ completedDate: '2026-07-31' }) }, { dateBucket: 'month' });
  assert.throws(() => invoke({ phase: undefined }), /0.6.5/);
  context.input = completed({ detectedType: image });
  assert.throws(() => vm.runInContext('archive(input)', context), /category-routing support/);
  context.input = { ...completed({ detectedType: image }), categoryRouting: false };
  assert.throws(() => vm.runInContext('archive(input)', context), /category-routing support/);
});
test('invalid content facts reject rather than guessing from a filename', () => {
  for (const detectedType of [[], 'image', { ...image, kind: '../image' }, { ...image, extension: '../png' }, { ...image, mime: 5 }]) {
    assert.throws(() => parse(completed({ fileName: 'photo.png', detectedType })), /content detection/);
  }
});
test('portable preview switches between recognized, unknown, pending and group results', () => {
  let view;
  const context = vm.createContext({ flux: { ui: { view: (_name, definition) => { view = definition; } } } });
  vm.runInContext('globalThis.AnimeArchiveSeedRules = ' + readFileSync(new URL('../rules.json', import.meta.url), 'utf8'), context);
  for (const path of ['../classifier.js', '../parser.js', '../main.js']) vm.runInContext(readFileSync(new URL(path, import.meta.url), 'utf8'), context);
  const state = view.init();
  const send = (node, value) => view.event(state, { node: 'root/' + node, type: 'change', value }, { refresh() {} });
  send('filename', 'photo.png');
  assert.match(state.preview, /photo\.png: unchanged/);
  send('preview-kind', 'image');
  send('preview-mime', 'image/png');
  send('preview-extension', 'png');
  assert.match(state.preview, /photo\.png: image/);
  send('filename', 'Show S01E01.mkv');
  assert.match(state.preview, /Show S01E01\.mkv: image/);
  send('preview-phase', 'start');
  assert.match(state.preview, /unchanged — Waiting for completed file content/);
  send('preview-phase', 'complete');
  assert.match(state.preview, /Show S01E01\.mkv: image/);
  send('preview-group', true);
  assert.match(state.preview, /unchanged — Task groups/);
  send('preview-group', false);
  send('preview-kind', '');
  assert.match(state.preview, /unchanged — No recognized file content/);
});
