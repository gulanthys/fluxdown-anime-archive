(function (root) {
  'use strict';
  const FIELDS = new Set(['platform', 'platformName', 'mediaKind', 'creatorId', 'creatorName', 'collectionId', 'collectionTitle', 'seriesId', 'seriesTitle', 'fileName', 'extension', 'category']);
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
  const object = value => !!value && typeof value === 'object' && !Array.isArray(value);
  function check(value, keys, label) {
    if (!object(value) || Object.keys(value).some(key => !keys.includes(key))) throw new Error(label + ' contains unsupported fields.');
  }
  function glob(pattern, text) {
    const p = Array.from(pattern.toLowerCase()), t = Array.from(text.toLowerCase());
    let i = 0, j = 0, star = -1, retry = 0;
    while (j < t.length) {
      if (i < p.length && (p[i] === '?' || p[i] === t[j])) { i++; j++; }
      else if (p[i] === '*') { star = i++; retry = j; }
      else if (star >= 0) { i = star + 1; j = ++retry; }
      else return false;
    }
    while (p[i] === '*') i++;
    return i === p.length;
  }
  function condition(node, depth = 0) {
    if (depth > 8) throw new Error('Condition nesting exceeds 8 levels.');
    check(node, ['all', 'any', 'not', 'field', 'equals', 'in', 'glob', 'exists'], 'Condition');
    const composite = ['all', 'any', 'not'].filter(key => own(node, key));
    if (composite.length) {
      if (Object.keys(node).length !== 1) throw new Error('A combined condition must use one operator.');
      const key = composite[0];
      if (key === 'not') { const child = condition(node.not, depth + 1); return facts => !child(facts); }
      if (!Array.isArray(node[key]) || !node[key].length || node[key].length > 32) throw new Error('Combined conditions require 1 to 32 entries.');
      const children = node[key].map(item => condition(item, depth + 1));
      return key === 'all' ? facts => children.every(fn => fn(facts)) : facts => children.some(fn => fn(facts));
    }
    if (!FIELDS.has(node.field)) throw new Error('Unsupported rule field: ' + String(node.field));
    const operators = ['equals', 'in', 'glob', 'exists'].filter(key => own(node, key));
    if (operators.length !== 1) throw new Error('A field condition requires exactly one operator.');
    const op = operators[0], expected = node[op];
    const text = value => typeof value === 'string' && value.length > 0 && value.length <= 256;
    if (op === 'exists') {
      if (typeof expected !== 'boolean') throw new Error('exists must be boolean.');
    } else if (op === 'in') {
      if (!Array.isArray(expected) || !expected.length || expected.length > 64 || !expected.every(text)) throw new Error('in requires 1 to 64 nonempty strings.');
    } else if (!text(expected)) throw new Error(op + ' requires bounded nonempty text.');
    return facts => {
      const actual = facts[node.field];
      const present = typeof actual === 'string' && actual.trim().length > 0;
      if (op === 'exists') return present === expected;
      if (!present) return false;
      if (op === 'equals') return actual === expected;
      if (op === 'in') return expected.includes(actual);
      return glob(expected, actual);
    };
  }
  function compile(raw) {
    if (typeof raw === 'string') {
      if (raw.length > 131072) throw new Error('Rule document exceeds 128 KiB.');
      try { raw = JSON.parse(raw); } catch (_) { throw new Error('Classifier rules are invalid JSON.'); }
    }
    if (JSON.stringify(raw).length > 131072) throw new Error('Rule document exceeds 128 KiB.');
    check(raw, ['version', 'classifiers', 'layouts'], 'Rule document');
    if (raw.version !== 1) throw new Error('Unsupported rule document version.');
    if (!Array.isArray(raw.classifiers) || raw.classifiers.length > 128 || !Array.isArray(raw.layouts) || raw.layouts.length > 128) throw new Error('Rules require at most 128 classifiers and layouts.');
    const ids = new Set();
    function id(value) {
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(value) || ids.has(value)) throw new Error('Rule IDs must be unique safe identifiers.');
      ids.add(value);
    }
    const classifiers = raw.classifiers.map(rule => {
      check(rule, ['id', 'when', 'category'], 'Classifier'); id(rule.id);
      if (typeof rule.category !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(rule.category)) throw new Error('Invalid category identifier.');
      return { id: rule.id, matches: condition(rule.when), category: rule.category };
    });
    const layouts = raw.layouts.map(rule => {
      check(rule, ['id', 'when', 'directories'], 'Layout'); id(rule.id);
      if (!Array.isArray(rule.directories) || !rule.directories.length || rule.directories.length > 8) throw new Error('A layout requires 1 to 8 directory segments.');
      const directories = rule.directories.map(segment => {
        check(segment, ['text', 'field', 'onMissing', 'fallback'], 'Directory segment');
        if (own(segment, 'text') === own(segment, 'field')) throw new Error('A segment must contain text or field.');
        if (own(segment, 'text')) {
          if (Object.keys(segment).length !== 1 || typeof segment.text !== 'string' || !segment.text.trim() || segment.text.length > 180 || /[\\/:*?"<>|\u0000-\u001f]/.test(segment.text) || /^(\.|\.\.|con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment.text) || /[. ]$/.test(segment.text)) throw new Error('Unsafe literal directory segment.');
        } else {
          if (!FIELDS.has(segment.field)) throw new Error('Unsupported directory field.');
          if (!['omit', 'rejectLayout', 'fallback'].includes(segment.onMissing || 'rejectLayout')) throw new Error('Unsupported missing-field policy.');
          if (segment.onMissing === 'fallback' && (typeof segment.fallback !== 'string' || !segment.fallback.trim() || segment.fallback.length > 180)) throw new Error('Missing fallback directory name.');
          if (segment.onMissing !== 'fallback' && own(segment, 'fallback')) throw new Error('fallback requires the fallback policy.');
        }
        return segment;
      });
      return { id: rule.id, matches: condition(rule.when), directories };
    });
    return { document: raw, classifiers, layouts };
  }
  function evaluate(compiled, facts, clean) {
    const classifier = compiled.classifiers.find(rule => rule.matches(facts));
    const context = { ...facts, category: classifier ? classifier.category : '' };
    for (const layout of compiled.layouts) {
      if (!layout.matches(context)) continue;
      const directories = [];
      let rejected = false;
      for (const segment of layout.directories) {
        let value = own(segment, 'text') ? segment.text : context[segment.field];
        if (typeof value !== 'string' || !value.trim()) {
          if (segment.onMissing === 'omit') continue;
          if (segment.onMissing === 'fallback') value = segment.fallback;
          else { rejected = true; break; }
        }
        const safe = clean(value, segment.field);
        if (!safe) { rejected = true; break; }
        directories.push(safe);
      }
      if (!rejected && directories.length && directories.join('/').length <= 1024) return { directories, reason: 'Layout: ' + layout.id + (classifier ? '; classifier: ' + classifier.id : ''), matchedRule: layout.id };
    }
    return null;
  }
  const api = { compile, evaluate };
  root.AnimeClassification = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
