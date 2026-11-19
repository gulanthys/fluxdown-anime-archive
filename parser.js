(function (root) {
  'use strict';
  const classification = root.AnimeClassification || (typeof require === 'function' ? require('./classifier.js') : null);
  function parse(context) {
    if (!context || !['start', 'complete'].includes(context.phase)) throw new Error('无效的归档阶段。');
    if (context.isGroup || context.phase === 'start') return null;
    const detected = context.detectedType;
    if (!detected) return null;
    if (typeof detected !== 'object' || Array.isArray(detected) || typeof detected.kind !== 'string' || !/^[a-z][a-z0-9_]{0,31}$/.test(detected.kind) || typeof detected.mime !== 'string' || detected.mime.length > 128 || typeof detected.extension !== 'string' || detected.extension.length > 32 || (detected.extension && !/^[a-z0-9-]+$/i.test(detected.extension))) throw new Error('无效的文件内容识别结果。');
    if (!classification) throw new Error('无法加载内置分类。');
    return classification.evaluate(detected);
  }
  const api = { parse };
  root.AnimeArchiveParser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
