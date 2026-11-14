// Preview and archive callbacks share the same content-only classifier.
function updatePreview(state) {
  try {
    var context = {
      phase: state.phase || 'complete',
      isGroup: !!state.isGroup,
      detectedType: state.detectedKind ? { kind: state.detectedKind, mime: state.detectedMime || '', extension: state.detectedExtension || '' } : null
    };
    var result = AnimeArchiveParser.evaluate(context);
    var destination = result.category || 'unchanged';
    var names = String(state.fileName || '').split(/\r?\n/).map(function (name) { return name.trim(); }).filter(Boolean);
    state.preview = 'SIMULATED ' + context.phase + ' · type ' + (state.detectedKind || '(unknown)') + '\n'
      + (names.length ? names : ['(no filename)']).map(function (name) {
        return name + ': ' + destination + ' — ' + result.reason;
      }).join('\n');
    state.error = '';
  } catch (error) { state.preview = ''; state.error = String(error.message || error); }
}
flux.ui.view('settings', {
  init: function () {
    return { fileName: '', phase: 'complete', isGroup: false, detectedKind: '', detectedMime: '', detectedExtension: '', error: '', preview: '' };
  },
  render: function (state) {
    var h = flux.ui.h;
    return h('stack', { gap: 'sm', padding: 'md' },
      h('textarea', { key: 'filename', value: state.fileName, placeholder: 'Display filenames, one per line (not used for classification)', rows: 4 }),
      h('select', { key: 'preview-phase', value: state.phase, options: [{ value: 'start', label: 'SIMULATED start' }, { value: 'complete', label: 'SIMULATED complete' }] }),
      h('input', { key: 'preview-kind', value: state.detectedKind, placeholder: 'Simulated detected kind (e.g. image)' }),
      h('input', { key: 'preview-mime', value: state.detectedMime, placeholder: 'Simulated content MIME (e.g. image/png)' }),
      h('input', { key: 'preview-extension', value: state.detectedExtension, placeholder: 'Simulated detected format extension (e.g. png)' }),
      h('switch', { key: 'preview-group', label: 'Task group preview (not classified)', checked: state.isGroup }),
      h('text', { text: state.error || state.preview || 'No classification match' }),
      h('text', { text: 'SIMULATION ONLY. Shows the requested built-in category id; the host resolves it to the configured visible category. No filename, extension or source fallback; unknown content stays in place.' })
    );
  },
  event: function (state, ev, ctx) {
    if (ev.type === 'change') {
      var id = ev.node.split('/').pop();
      var value = String(ev.value || '');
      if (id === 'filename') state.fileName = value;
      else if (id === 'preview-phase') state.phase = value;
      else if (id === 'preview-kind') state.detectedKind = value;
      else if (id === 'preview-mime') state.detectedMime = value;
      else if (id === 'preview-extension') state.detectedExtension = value;
      else if (id === 'preview-group') state.isGroup = ev.value === true;
    }
    updatePreview(state);
    ctx.refresh();
  }
});
