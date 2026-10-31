// Parser source is concatenated by build.mjs so preview and archive routing share identical logic.
function animeSettings() {
  var value = flux.settings || {};
  if (typeof value.aliases === 'string') { try { value.aliases = JSON.parse(value.aliases || '{}'); } catch (_) { throw new Error('Alias settings are invalid JSON.'); } }
  if (typeof value.rules === 'string') { try { value.rules = JSON.parse(value.rules || '[]'); } catch (_) { throw new Error('Rule settings are invalid JSON.'); } }
  if (!value.aliases || typeof value.aliases !== 'object' || Array.isArray(value.aliases)) throw new Error('Aliases must be a title-to-display-name object.');
  if (!Array.isArray(value.rules)) throw new Error('Rules must be an ordered rule list.');
  return value;
}
function updatePreview(state) {
  try { state.preview = AnimeArchiveParser.parse(state.fileName, animeSettings())?.folderName || ''; state.error = ''; }
  catch (error) { state.preview = ''; state.error = String(error.message || error); }
}
flux.ui.view('settings', {
  init: function () {
    try { var c = animeSettings(); AnimeArchiveParser.parse('config-validation.mkv', c); return { fileName: '', aliasFrom: '', aliasTo: '', rulePattern: '', ruleAction: 'include', ruleTitle: '', aliases: Object.keys(c.aliases).map(function (k) { return { from: k, to: c.aliases[k] }; }), rules: c.rules, error: '', preview: '' }; }
    catch (error) { return { fileName: '', aliases: [], rules: [], error: String(error.message || error), preview: '' }; }
  },
  render: function (state) {
    var h = flux.ui.h;
    var children = [
      h('input', { id: 'filename', value: state.fileName, placeholder: 'Preview filename, e.g. Show S01E02 [1080p].mkv' }),
      h('text', { text: state.error || state.preview || 'No matching archive folder' }),
      h('input', { id: 'alias-source', value: state.aliasFrom || '', placeholder: 'Alias source title' }),
      h('input', { id: 'alias-target', value: state.aliasTo || '', placeholder: 'Display folder title' }),
      h('button', { id: 'save-alias', text: 'Add or update alias' }),
      h('input', { id: 'rule-pattern', value: state.rulePattern || '', placeholder: 'Rule filename regex' }),
      h('input', { id: 'rule-action', value: state.ruleAction || 'include', placeholder: 'include / exclude / assign' }),
      h('input', { id: 'rule-title', value: state.ruleTitle || '', placeholder: 'Assigned title' }),
      h('button', { id: 'add-rule', text: 'Add ordered rule' }),
      h('button', { id: 'update-rule', text: 'Update selected rule' })
    ];
    state.aliases.forEach(function (a, i) {
      children.push(h('text', { text: 'Alias: ' + a.from + ' → ' + a.to }));
      children.push(h('button', { id: 'remove-alias-' + i, text: 'Remove alias ' + a.from }));
    });
    state.rules.forEach(function (r, i) {
      children.push(h('text', { text: (i + 1) + '. ' + r.action + ' /' + r.pattern + '/ ' + (r.title || '') }));
      children.push(h('button', { id: 'edit-rule-' + i, text: 'Load rule ' + (i + 1) + ' for update' }));
      children.push(h('button', { id: 'remove-rule-' + i, text: 'Remove rule ' + (i + 1) }));
    });
    return h.apply(null, ['stack', { gap: 'sm', padding: 'md' }].concat(children));
  },
  event: async function (state, ev, ctx) {
    try {
      if (ev.type === 'change') {
        var value = String(ev.value || '');
        if (ev.id === 'filename') state.fileName = value;
        else if (ev.id === 'alias-source') state.aliasFrom = value;
        else if (ev.id === 'alias-target') state.aliasTo = value;
        else if (ev.id === 'rule-pattern') state.rulePattern = value;
        else if (ev.id === 'rule-action') state.ruleAction = value;
        else if (ev.id === 'rule-title') state.ruleTitle = value;
      } else if (ev.type === 'press' && ev.id === 'save-alias') {
        var aliases = animeSettings().aliases;
        var source = state.aliasFrom.trim();
        var target = state.aliasTo.trim();
        if (!source || !target) throw new Error('Both alias titles are required.');
        aliases[source] = target;
        await flux.settings.update({ aliases: JSON.stringify(aliases) });
        state.aliases = Object.keys(aliases).map(function (k) { return { from: k, to: aliases[k] }; });
      } else if (ev.type === 'press' && ev.id.indexOf('remove-alias-') === 0) {
        var aliases = animeSettings().aliases;
        delete aliases[state.aliases[Number(ev.id.slice(13))].from];
        await flux.settings.update({ aliases: JSON.stringify(aliases) });
        state.aliases = Object.keys(aliases).map(function (k) { return { from: k, to: aliases[k] }; });
      } else if (ev.type === 'press' && ev.id === 'add-rule') {
        var rules = animeSettings().rules;
        rules.push({ pattern: state.rulePattern, action: state.ruleAction, title: state.ruleTitle || undefined });
        await flux.settings.update({ rules: JSON.stringify(rules) });
        state.rules = rules;
      } else if (ev.type === 'press' && ev.id.indexOf('edit-rule-') === 0) {
        var index = Number(ev.id.slice(10));
        var selected = state.rules[index];
        state.rulePattern = selected.pattern;
        state.ruleAction = selected.action;
        state.ruleTitle = selected.title || '';
        state.selectedRule = index;
      } else if (ev.type === 'press' && ev.id.indexOf('remove-rule-') === 0) {
        var index = Number(ev.id.slice(12));
        var rules = animeSettings().rules;
        rules.splice(index, 1);
        await flux.settings.update({ rules: JSON.stringify(rules) });
        state.rules = rules;
        if (state.selectedRule === index) state.selectedRule = null;
        else if (Number.isInteger(state.selectedRule) && state.selectedRule > index) state.selectedRule -= 1;
      } else if (ev.type === 'press' && ev.id === 'update-rule') {
        var rules = animeSettings().rules;
        if (!Number.isInteger(state.selectedRule) || !rules[state.selectedRule]) throw new Error('Select a rule before updating it.');
        rules[state.selectedRule] = { pattern: state.rulePattern, action: state.ruleAction, title: state.ruleTitle || undefined };
        await flux.settings.update({ rules: JSON.stringify(rules) });
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
