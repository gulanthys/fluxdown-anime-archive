(function (root) {
  'use strict';
  const rules = root.AnimeArchiveSeedRules || (typeof require === 'function' ? require('./rules.json') : null);
  function evaluate(detected) {
    if (!rules) throw new Error('Built-in classification rules are unavailable.');
    const category = Object.prototype.hasOwnProperty.call(rules.kindCategories, detected.kind)
      ? rules.kindCategories[detected.kind]
      : detected.mime.startsWith('text/') ? rules.textCategory : null;
    return category ? { category, reason: 'Detected content: ' + detected.kind + ' (' + detected.mime + ')' } : null;
  }
  const api = { evaluate };
  root.AnimeClassification = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
