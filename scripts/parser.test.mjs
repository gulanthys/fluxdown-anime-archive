import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { parse } = require('../parser.js');
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
  assert.throws(() => parse('Show S01E01.mkv', { rules: [{ pattern: '[', action: 'include' }] }), /Rule 1 has an invalid regex/);
  assert.throws(() => parse('Show S01E01.mkv', { rules: [{ pattern: 'Show', action: 'assign' }] }), /needs an assigned title/);
  assert.equal(p('Show S01E01.mkv', { rules: [{ pattern: 'Show', action: 'include' }, { pattern: 'Show', action: 'assign', title: 'Wrong' }] }), 'Show');
});
