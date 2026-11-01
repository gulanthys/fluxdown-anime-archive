// Parser source is concatenated by build.mjs so preview and archive routing share identical logic.
function animeSettings() {
  var value = flux.settings || {};
  return AnimeArchiveParser.validate(value);
}
function updatePreview(state) {
  try {
    var cfg = Object.assign({}, state.config, { isGroup: !!state.isGroup });
    if (state.metadataText) cfg.metadata = JSON.parse(state.metadataText);
    else cfg.metadata = null;
    var lines = String(state.fileName || '').split(/\r?\n/).filter(function (x) { return x.trim(); });
    state.preview = lines.map(function (name) {
      var result = AnimeArchiveParser.evaluate(name.trim(), cfg);
      return name.trim() + ': ' + (result && result.folderName ? result.folderName + ' — ' + result.reason : 'unchanged' + (result && result.reason ? ' — ' + result.reason : ''));
    }).join('\n');
    state.error = '';
  } catch (error) { state.preview = ''; state.error = String(error.message || error); }
}
async function updateSettings(state, patch) {
  var next = AnimeArchiveParser.validate(Object.assign({}, state.config, patch));
  await flux.settings.update(patch);
  state.config = next;
}
function ruleFromState(state) {
  function list(value) { return String(value || '').split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean); }
  return { pattern: state.rulePattern, extensions: String(state.ruleExtensions || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean), all: list(state.ruleAll), any: list(state.ruleAny), not: list(state.ruleNot), action: state.ruleAction, title: state.ruleTitle || undefined };
}
flux.ui.view('settings', {
  init: function () {
    try { var c = animeSettings(); return { config: c, isGroup: false, fileName: '', metadataText: '', aliasFrom: '', aliasTo: '', rulePattern: '', ruleExtensions: '', ruleAll: '', ruleAny: '', ruleNot: '', ruleAction: 'include', ruleTitle: '', videoGrouping: c.videoGrouping || 'auto', aliases: Object.keys(c.aliases).map(function (k) { return { from: k, to: c.aliases[k] }; }), rules: c.rules, error: '', preview: '' }; }
    catch (error) { return { fileName: '', aliases: [], rules: [], error: String(error.message || error), preview: '' }; }
  },
  render: function (state) {
    var h = flux.ui.h;
    var children = [
      h('textarea', { key: 'filename', value: state.fileName, placeholder: 'Preview filenames, one per line', rows: 4 }),
      h('textarea', { key: 'source-metadata', value: state.metadataText || '', placeholder: 'Preview source metadata JSON (optional)', rows: 3 }),
      h('switch', { key: 'preview-group', label: 'Task group preview (keep member directories)', checked: !!state.isGroup }),
      h('select', { key: 'video-grouping', value: state.videoGrouping || 'auto', options: [{ value: 'auto', label: 'Automatic' }, { value: 'creator', label: 'Creator' }, { value: 'collection', label: 'Collection' }] }),
      h('text', { text: state.error || state.preview || 'No classification match' }),
      h('input', { key: 'alias-source', value: state.aliasFrom || '', placeholder: 'Alias source title' }),
      h('input', { key: 'alias-target', value: state.aliasTo || '', placeholder: 'Display folder title' }),
      h('button', { key: 'save-alias', text: 'Add or update alias' }),
      h('input', { key: 'rule-pattern', value: state.rulePattern || '', placeholder: 'Filename regex (optional)' }),
      h('input', { key: 'rule-extensions', value: state.ruleExtensions || '', placeholder: 'Extensions, e.g. pdf, epub, mkv' }),
      h('textarea', { key: 'rule-all', value: state.ruleAll || '', placeholder: 'All regex conditions, one per line', rows: 2 }),
      h('textarea', { key: 'rule-any', value: state.ruleAny || '', placeholder: 'Any regex conditions, one per line', rows: 2 }),
      h('textarea', { key: 'rule-not', value: state.ruleNot || '', placeholder: 'Excluded regex conditions, one per line', rows: 2 }),
      h('select', { key: 'rule-action', value: state.ruleAction || 'include', options: [{ value: 'include', label: 'Include' }, { value: 'exclude', label: 'Exclude' }, { value: 'assign', label: 'Assign folder' }] }),
      h('input', { key: 'rule-title', value: state.ruleTitle || '', placeholder: 'Folder template (capture with $1)' }),
      h('button', { key: 'add-rule', text: 'Add ordered rule' }),
      h('button', { key: 'update-rule', text: 'Update selected rule' })
    ];
    state.aliases.forEach(function (a, i) {
      children.push(h('text', { text: 'Alias ' + (i + 1) + ': ' + a.from + ' → ' + a.to }));
      children.push(h('button', { key: 'remove-alias-' + i, text: 'Remove alias ' + (i + 1) }));
    });
    state.rules.forEach(function (r, i) {
      children.push(h('text', { text: (i + 1) + '. ' + r.action + ' /' + r.pattern + '/ ' + (r.title || '') }));
      children.push(h('button', { key: 'edit-rule-' + i, text: 'Load rule ' + (i + 1) + ' for update' }));
      children.push(h('button', { key: 'remove-rule-' + i, text: 'Remove rule ' + (i + 1) }));
    });
    return h.apply(null, ['stack', { gap: 'sm', padding: 'md' }].concat(children));
  },
  event: async function (state, ev, ctx) {
    try {
      var id = ev.node.split('/').pop();
      if (ev.type === 'change') {
        var value = String(ev.value || '');
        if (id === 'filename') state.fileName = value;
        else if (id === 'source-metadata') state.metadataText = value;
        else if (id === 'preview-group') state.isGroup = ev.value === true;
        else if (id === 'video-grouping') { await updateSettings(state, { videoGrouping: value }); state.videoGrouping = value; }
        else if (id === 'alias-source') state.aliasFrom = value;
        else if (id === 'alias-target') state.aliasTo = value;
        else if (id === 'rule-pattern') state.rulePattern = value;
        else if (id === 'rule-extensions') state.ruleExtensions = value;
        else if (id === 'rule-all') state.ruleAll = value;
        else if (id === 'rule-any') state.ruleAny = value;
        else if (id === 'rule-not') state.ruleNot = value;
        else if (id === 'rule-action') state.ruleAction = value;
        else if (id === 'rule-title') state.ruleTitle = value;
      } else if (ev.type === 'press' && id === 'save-alias') {
        var aliases = Object.assign({}, state.config.aliases);
        var source = state.aliasFrom.trim();
        var target = state.aliasTo.trim();
        if (!source || !target) throw new Error('Both alias titles are required.');
        aliases[source] = target;
        await updateSettings(state, { aliases: JSON.stringify(aliases) });
        state.aliases = Object.keys(aliases).map(function (k) { return { from: k, to: aliases[k] }; });
      } else if (ev.type === 'press' && id.indexOf('remove-alias-') === 0) {
        var aliases = Object.assign({}, state.config.aliases);
        delete aliases[state.aliases[Number(id.slice(13))].from];
        await updateSettings(state, { aliases: JSON.stringify(aliases) });
        state.aliases = Object.keys(aliases).map(function (k) { return { from: k, to: aliases[k] }; });
      } else if (ev.type === 'press' && id === 'add-rule') {
        var rules = state.config.rules.slice();
        rules.push(ruleFromState(state));
        await updateSettings(state, { rules: JSON.stringify(rules) });
        state.rules = rules;
      } else if (ev.type === 'press' && id.indexOf('edit-rule-') === 0) {
        var index = Number(id.slice(10));
        var selected = state.rules[index];
        state.rulePattern = selected.pattern || '';
        state.ruleExtensions = Array.isArray(selected.extensions) ? selected.extensions.join(', ') : selected.extensions || '';
        state.ruleAll = (selected.all || []).join('\n');
        state.ruleAny = (selected.any || []).join('\n');
        state.ruleNot = (selected.not || []).join('\n');
        state.ruleAction = selected.action;
        state.ruleTitle = selected.title || '';
        state.selectedRule = index;
      } else if (ev.type === 'press' && id.indexOf('remove-rule-') === 0) {
        var index = Number(id.slice(12));
        var rules = state.config.rules.slice();
        rules.splice(index, 1);
        await updateSettings(state, { rules: JSON.stringify(rules) });
        state.rules = rules;
        if (state.selectedRule === index) state.selectedRule = null;
        else if (Number.isInteger(state.selectedRule) && state.selectedRule > index) state.selectedRule -= 1;
      } else if (ev.type === 'press' && id === 'update-rule') {
        var rules = state.config.rules.slice();
        if (!Number.isInteger(state.selectedRule) || !rules[state.selectedRule]) throw new Error('Select a rule before updating it.');
        rules[state.selectedRule] = ruleFromState(state);
        await updateSettings(state, { rules: JSON.stringify(rules) });
        state.rules = rules;
      }
      updatePreview(state);
    } catch (error) {
      state.preview = '';
      state.error = String(error.message || error);
    }
    ctx.refresh();
  }
});
