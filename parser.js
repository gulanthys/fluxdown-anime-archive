(function (root) {
  'use strict';
  const classification = root.AnimeClassification || (typeof require === 'function' ? require('./classifier.js') : null);
  function evaluate(context) {
    if (!context || !['start', 'complete'].includes(context.phase)) throw new Error('Invalid archive phase.');
    if (context.isGroup) return { reason: 'Task groups have no single content result; left unchanged' };
    if (context.phase === 'start') return { reason: 'Waiting for completed file content' };
    const detected = context.detectedType;
    if (!detected) return { reason: 'No recognized file content; left unchanged' };
    if (typeof detected !== 'object' || Array.isArray(detected) || typeof detected.kind !== 'string' || !/^[a-z][a-z0-9_]{0,31}$/.test(detected.kind) || typeof detected.mime !== 'string' || detected.mime.length > 128 || typeof detected.extension !== 'string' || detected.extension.length > 32 || (detected.extension && !/^[a-z0-9-]+$/i.test(detected.extension))) throw new Error('Invalid content detection facts.');
    if (!classification) throw new Error('Classification engine is unavailable.');
    return classification.evaluate(detected) || { reason: 'No built-in category for detected content; left unchanged' };
  }
  function parse(context) {
    const result = evaluate(context);
    return result.category ? { category: result.category } : null;
  }
  const api = { parse, evaluate };
  root.AnimeArchiveParser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
