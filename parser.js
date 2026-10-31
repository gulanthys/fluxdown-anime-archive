(function (root) {
  'use strict';
  const VIDEO = /\.(mkv|mp4|m4v|avi|wmv|mov|webm|flv|ts|m2ts)$/i;
  const TECH = /\.(?:mkv|mp4|m4v|avi|wmv|mov|webm|flv|ts|m2ts)$/i;
  function parse(fileName, config = {}) {
    if (typeof fileName !== 'string' || !VIDEO.test(fileName)) return null;
    config = config || {};
    if (typeof config.aliases === 'string') { try { config = { ...config, aliases: JSON.parse(config.aliases || '{}') }; } catch (_) { throw new Error('Alias settings are invalid JSON.'); } }
    if (typeof config.rules === 'string') { try { config = { ...config, rules: JSON.parse(config.rules || '[]') }; } catch (_) { throw new Error('Rule settings are invalid JSON.'); } }
    const aliases = config.aliases === undefined ? {} : config.aliases;
    if (!aliases || typeof aliases !== 'object' || Array.isArray(aliases)) throw new Error('Aliases must be a title-to-display-name object.');
    for (const [source, target] of Object.entries(aliases)) {
      if (!source.trim() || typeof target !== 'string' || !target.trim()) throw new Error('Every alias needs a source title and display title.');
    }
    const rules = config.rules === undefined ? [] : config.rules;
    if (!Array.isArray(rules)) throw new Error('Rules must be an ordered rule list.');
    const compiledRules = rules.map((rule, index) => {
      if (!rule || typeof rule.pattern !== 'string' || !rule.pattern.trim()) throw new Error(`Rule ${index + 1} needs a filename regex.`);
      let re;
      try { re = new RegExp(rule.pattern, 'i'); } catch (_) { throw new Error(`Rule ${index + 1} has an invalid regex.`); }
      if (!['include', 'exclude', 'assign'].includes(rule.action)) throw new Error(`Rule ${index + 1} has an invalid action.`);
      if (rule.action === 'assign' && (typeof rule.title !== 'string' || !rule.title.trim())) throw new Error(`Rule ${index + 1} needs an assigned title.`);
      return { rule, re };
    });
    for (const { rule, re } of compiledRules) {
      if (!re.test(fileName)) continue;
      if (rule.action === 'exclude') return null;
      if (rule.action === 'assign') return result(rule.title, config);
      break;
    }
    let s = fileName.replace(TECH, '').trim();
    // Release labels and technical suffixes, repeatedly, only at filename edges.
    const before = s;
    s = s.replace(/\s*[[(（【][^\])）】]*(?:\d{3,4}p|\d{3,4}x\d{3,4}|\b(?:1080p|720p|2160p|480p|x264|x265|HEVC|AV1|WEB[- .]?DL|Blu[- .]?ray|BDRip|HDR|10bit|AAC|FLAC|繁体|简体|简|繁|字幕|CHS|CHT|中字)\b)[^\])）】]*[\])）】]\s*$/gi, '');
    s = s.replace(/\s*[-_. ]+(?:1080p|720p|2160p|480p|x264|x265|HEVC|AV1|WEB[- .]?DL|Blu[- .]?ray|BDRip|HDR|10bit|AAC|FLAC)\s*$/i, '').trim();
    const episodeLike = /(?:\bS\d{1,2}\s*E\d{1,3}\b|\b\d{1,2}x\d{1,3}\b|第\s*\d{1,4}\s*[集话話]|(?:^|\s)[-–—_]\s*\d{1,4}(?:\s|$)|\bSeason\s*\d{1,2}\b|第\s*\d{1,2}\s*季)/i.test(s);
    if (!episodeLike) return null;
    let m = s.match(/(?:^|\s)[\[(（【 ]*S\d{1,2}\s*E\d{1,3}(?:\b|$)/i) || s.match(/(?:^|\s)\d{1,2}x\d{1,3}(?:\b|$)/i);
    if (m) s = s.slice(0, m.index).trim();
    else {
      m = s.match(/(?:第\s*\d{1,2}\s*季|Season\s*\d{1,2})/i);
      if (m) s = s.replace(m[0], '').trim();
      s = s.replace(/(?:第\s*)?\d{1,4}\s*[集话話](?=\s|$)/g, '').trim();
    }
    // Remove common episode/release separators and bracketed fansub name labels.
    s = s.replace(/\s*[-–—_]\s*\d{1,4}\s*$/u, '').replace(/\s*[[(（【][^\])）】]*[\])）】]\s*$/g, '').trim();
    if (!s) return null;
    if (s === before && !/[\u3400-\u9fffA-Za-z]/.test(s)) return null;
    return result(s, config);
  }
  function result(title, config) {
    const aliases = config.aliases && typeof config.aliases === 'object' ? config.aliases : {};
    title = aliases[title] || title;
    title = String(title).replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/[. ]+$/g, '').trim();
    if (!title || title === '.' || title === '..') return null;
    return { folderName: title };
  }
  const api = { parse };
  root.AnimeArchiveParser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
