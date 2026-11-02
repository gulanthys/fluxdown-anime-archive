(function (root) {
  'use strict';
  const classification = root.AnimeClassification || (typeof require === 'function' ? require('./classifier.js') : null);
  const seed = root.AnimeArchiveSeedRules || (typeof require === 'function' ? require('./rules.json') : null);
  const TYPES = {
    video: /\.(mkv|mp4|m4v|avi|wmv|mov|webm|flv|ts|m2ts)$/i,
    nonVideo: /\.(pdf|docx?|odt|rtf|txt|md|pptx?|xlsx?|csv|jpe?g|png|gif|webp|bmp|tiff?|svg|heic|avif|mp3|flac|wav|m4a|aac|ogg|opus|wma|aiff|epub|mobi|azw3?|fb2|cbz|cbr)$/i
  };
  const BLOCKED_MEDIA = /\.(zip|rar|7z|tar|gz|bz2|xz|exe|msi|apk|aab|dmg|iso|deb|rpm|cab)$/i;
  function settings(input) {
    let config = input || {};
    if (typeof config.aliases === 'string') { try { config = { ...config, aliases: JSON.parse(config.aliases || '{}') }; } catch (_) { throw new Error('Alias settings are invalid JSON.'); } }
    if (typeof config.rules === 'string') { try { config = { ...config, rules: JSON.parse(config.rules || '[]') }; } catch (_) { throw new Error('Rule settings are invalid JSON.'); } }
    if (typeof config.ruleDocument === 'string' && config.ruleDocument.length > 131072) throw new Error('Rule document exceeds 128 KiB.');
    if (typeof config.ruleDocument === 'string' && config.ruleDocument.trim()) { try { config = { ...config, ruleDocument: JSON.parse(config.ruleDocument) }; } catch (_) { throw new Error('Classifier rules are invalid JSON.'); } }
    const aliases = config.aliases === undefined ? {} : config.aliases;
    if (!aliases || typeof aliases !== 'object' || Array.isArray(aliases)) throw new Error('Aliases must be a title-to-display-name object.');
    for (const [key, value] of Object.entries(aliases)) if (!key.trim() || typeof value !== 'string' || !value.trim()) throw new Error('Every alias needs a source key and display name.');
    const rules = config.rules === undefined ? [] : config.rules;
    if (!Array.isArray(rules) || rules.length > 128) throw new Error('Rules must be an ordered rule list of at most 128 entries.');
    const compiled = rules.map((rule, index) => {
      if (!rule || typeof rule !== 'object') throw new Error(`Rule ${index + 1} must be an object.`);
      const pattern = rule.pattern === undefined ? '' : rule.pattern;
      if (typeof pattern !== 'string') throw new Error(`Rule ${index + 1} pattern must be text.`);
      let re = null;
      if (pattern.trim()) { try { re = new RegExp(pattern, 'i'); } catch (_) { throw new Error(`Rule ${index + 1} has an invalid regex.`); } }
      const list = (field) => {
        const value = rule[field] === undefined ? [] : rule[field];
        if (!Array.isArray(value) || value.some(x => typeof x !== 'string' || !x.trim())) throw new Error(`Rule ${index + 1} ${field} must be a list of non-empty patterns.`);
        return value.map(x => { try { return new RegExp(x, 'i'); } catch (_) { throw new Error(`Rule ${index + 1} has an invalid ${field} condition.`); } });
      };
      let extensions = rule.extensions === undefined ? [] : rule.extensions;
      if (typeof extensions === 'string') extensions = extensions.split(',').map(x => x.trim()).filter(Boolean);
      if (!Array.isArray(extensions) || extensions.some(x => typeof x !== 'string' || !/^[a-z0-9]+$/i.test(x.replace(/^\./, '')))) throw new Error(`Rule ${index + 1} extensions must be comma-separated filename extensions.`);
      extensions = extensions.map(x => x.replace(/^\./, '').toLowerCase());
      const all = list('all'), any = list('any'), not = list('not');
      if (!re && !extensions.length && !all.length && !any.length && !not.length) throw new Error(`Rule ${index + 1} needs a filename regex or a condition.`);
      if (!['include', 'exclude', 'assign'].includes(rule.action)) throw new Error(`Rule ${index + 1} has an invalid action.`);
      if (rule.action === 'assign' && (typeof rule.title !== 'string' || !rule.title.trim())) throw new Error(`Rule ${index + 1} needs an assigned title.`);
      return { rule, re, all, any, not, extensions };
    });
    const document = config.ruleDocument || seed;
    if (!classification) throw new Error('Classification engine is unavailable.');
    const compiledClassifiers = classification.compile(document);
    if (!['auto', 'creator', 'collection', undefined].includes(config.videoGrouping)) throw new Error('Video grouping must be auto, creator or collection.');
    return { ...config, aliases, rules, compiled, ruleDocument: document, compiledClassifiers };
  }
  function clean(value, aliases, keys) {
    let title = String(value || '').trim();
    for (const key of keys || []) if (Object.prototype.hasOwnProperty.call(aliases, key)) { title = aliases[key]; break; }
    if (Object.prototype.hasOwnProperty.call(aliases, title)) title = aliases[title];
    title = title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '').replace(/[. ]+$/g, '').replace(/^\s+|\s+$/g, '');
    if (!title || title === '.' || title === '..' || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(title)) return null;
    let bytes = 0;
    for (const character of title) { const cp = character.codePointAt(0); bytes += cp <= 0x7f ? 1 : cp <= 0x7ff ? 2 : cp <= 0xffff ? 3 : 4; if (bytes > 180) return null; }
    return title;
  }
  function evaluateFile(fileName, input) {
    const config = settings(input);
    if (typeof fileName !== 'string' || !fileName) return { folderName: null, directories: null, reason: 'No filename supplied' };
    const metadata = config.metadata || null;
    const hasNonVideoExtension = TYPES.nonVideo.test(fileName);
    const isVideo = TYPES.video.test(fileName) || (!!config.isGroup && !!metadata && !hasNonVideoExtension && !BLOCKED_MEDIA.test(fileName));
    const platformNames = { bilibili: '哔哩哔哩', youtube: 'YouTube', douyin: '抖音', tiktok: 'TikTok', niconico: 'Niconico' };
    for (const { rule, re, all, any, not, extensions } of config.compiled) {
      const ext = (fileName.match(/\.([^.\\/]+)$/) || [])[1] || '';
      if (extensions.length && !extensions.includes(ext.toLowerCase())) continue;
      const match = re ? re.exec(fileName) : null;
      if (re && !match) continue;
      if (all.some(condition => !condition.test(fileName))) continue;
      if (any.length && !any.some(condition => condition.test(fileName))) continue;
      if (not.some(condition => condition.test(fileName))) continue;
      if (rule.action === 'exclude') return { folderName: null, reason: `Excluded by rule: ${rule.pattern || extensions.join(',')}`, matchedRule: rule.pattern || null };
      if (rule.action === 'assign') {
        let missing = false;
        const title = rule.title.replace(/\$([1-9])/g, (_, n) => { if (!match || match[Number(n)] === undefined) { missing = true; return ''; } return match[Number(n)]; });
        if (missing) return { folderName: null, reason: `Rule template needs a capture that did not match: ${rule.title}`, matchedRule: rule.pattern || null };
        return { folderName: clean(title, config.aliases, []), reason: `Assigned by rule: ${rule.pattern || extensions.join(',')}`, matchedRule: rule.pattern || null };
      }
      break;
    }
    const facts = { ...(metadata || {}), fileName, extension: ((fileName.match(/\.([^.\\/]+)$/) || [])[1] || '').toLowerCase() };
    facts.platformName = platformNames[String(facts.platform || '').toLowerCase()] || facts.platform || '';
    const classified = classification.evaluate(config.compiledClassifiers, facts, (value, field) => {
      const kind = { creatorName: 'creator', collectionTitle: 'collection', seriesTitle: 'series' }[field];
      const entityId = kind && metadata && metadata[kind + 'Id'];
      return clean(value, config.aliases, kind && metadata.platform && entityId ? [metadata.platform + ':' + kind + ':' + entityId] : []);
    });
    if (classified && (!isVideo || config.ruleDocument !== seed || (metadata && (!config.videoGrouping || config.videoGrouping === 'auto')))) return classified;
    if (config.ruleDocument !== seed) return { folderName: null, reason: 'No personal layout matched; left unchanged' };
    if (metadata && isVideo) {
      let key, title, reason;
      const mode = config.videoGrouping || 'auto';
      const series = metadata.mediaKind === 'series' && metadata.seriesTitle;
      if (mode === 'auto' && series) { key = metadata.platform && metadata.seriesId ? `${metadata.platform}:series:${metadata.seriesId}` : null; title = metadata.seriesTitle; reason = 'Video series from source metadata'; }
      else if (mode === 'creator' && metadata.creatorName) { key = metadata.platform && metadata.creatorId ? `${metadata.platform}:creator:${metadata.creatorId}` : null; title = metadata.creatorName; reason = 'Video creator from source metadata'; }
      else if (mode === 'collection' && metadata.collectionTitle) { key = metadata.platform && metadata.collectionId ? `${metadata.platform}:collection:${metadata.collectionId}` : null; title = metadata.collectionTitle; reason = 'Video collection from source metadata'; }
      else if (series) { key = metadata.platform && metadata.seriesId ? `${metadata.platform}:series:${metadata.seriesId}` : null; title = metadata.seriesTitle; reason = 'Video series from source metadata'; }
      else if (metadata.creatorName) { key = metadata.platform && metadata.creatorId ? `${metadata.platform}:creator:${metadata.creatorId}` : null; title = metadata.creatorName; reason = 'Video creator from source metadata'; }
      else if (metadata.collectionTitle) { key = metadata.platform && metadata.collectionId ? `${metadata.platform}:collection:${metadata.collectionId}` : null; title = metadata.collectionTitle; reason = 'Video collection from source metadata'; }
      if (title) {
        const folder = clean(title, config.aliases, key ? [key] : []);
        const platform = clean(facts.platformName, {}, []);
        return folder ? { directories: ['视频'].concat(platform ? [platform] : [], [folder]), reason, metadata: true } : { folderName: null, reason: 'Unsafe source title' };
      }
    }
    if (!isVideo) return { folderName: null, reason: 'No matching rule; left unchanged' };
    const stem = fileName.replace(TYPES.video, '').trim();
    const hasEpisode = /(?:\bS\d{1,2}\s*E\d{1,3}\b|\b\d{1,2}x\d{1,3}\b|第\s*\d{1,4}\s*[集话話]|(?:^|\s)[-–—_]\s*\d{1,4}(?:\s|$)|\bSeason\s*\d{1,2}\b|第\s*\d{1,2}\s*季|\bOVA\b)/i.test(stem);
    if (!hasEpisode) return classified || { folderName: null, reason: 'No recognized episode marker; left unchanged' };
    if (config.isGroup) return classified || { folderName: null, reason: 'Group filenames are not parsed without source metadata or a rule' };
    let title = stem;
    if (root.AnitomyBundled) {
      const parsed = root.AnitomyBundled.parse(fileName);
      if (parsed && parsed.title) {
        title = parsed.title;
        const year = stem.match(/\b(?:19|20)\d{2}\b/);
        if (year && !new RegExp(`\\b${year[0]}\\b`).test(title)) title = `${title} ${year[0]}`;
      }
    } else {
      title = title.replace(/\s*[-–—_]\s*\d{1,4}(?=\s|$)/g, '').replace(/\bS\d{1,2}\s*E\d{1,3}\b|\b\d{1,2}x\d{1,3}\b/ig, '').replace(/第\s*\d{1,4}\s*[集话話]/g, '').replace(/第\s*\d{1,2}\s*季/g, '').replace(/\bSeason\s*\d{1,2}\b/ig, '').replace(/\s*[[(（【][^\])）】]*[\])）】]\s*$/g, '').trim();
    }
    title = title.replace(/\s*第\s*\d{1,2}\s*季/g, '').trim();
    const folderName = clean(title, config.aliases, []);
    return folderName ? { directories: ['视频', folderName], reason: root.AnitomyBundled ? 'Parsed video filename' : 'Video filename fallback' } : { folderName: null, reason: 'Parsed title is not a safe folder name' };
  }
  function evaluate(fileName, input) {
    const result = evaluateFile(fileName, input);
    if (result && result.directories) {
      let bytes = result.directories.length - 1;
      for (const part of result.directories) {
        for (const character of part) {
          const code = character.codePointAt(0);
          bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
        }
      }
      if (bytes > 180) return { folderName: null, reason: 'Directory path exceeds the host limit of 180 UTF-8 bytes; left unchanged' };
    }
    return result;
  }
  function parse(fileName, input) {
    const result = evaluate(fileName, input);
    if (result && result.directories) return { directories: result.directories };
    return result && result.folderName ? { folderName: result.folderName } : null;
  }
  const api = { parse, evaluate, validate: settings };
  root.AnimeArchiveParser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
