globalThis.archive = function (ctx) {
  if (!ctx || ctx.categoryRouting !== true) {
    throw new Error('Anime Archive requires a newer FluxDown host with archive category-routing support.');
  }
  if (!['start', 'complete'].includes(ctx.phase) || typeof ctx.createdDate !== 'string' || !/^(?:\d{4}-\d{2}-\d{2})?$/.test(ctx.createdDate)) {
    throw new Error('Anime Archive requires the FluxDown 0.6.5 archive context (phase, createdDate and completion content detection).');
  }
  var mode = flux.settings.archiveMode;
  if (ctx.completedDate && ctx.phase === 'complete' && !ctx.isGroup) {
    switch (mode) {
      case 'day': return { dateBucket: 'day' };
      case 'month': return { dateBucket: 'month' };
      case 'category-day':
      case 'category-month':
        var result = AnimeArchiveParser.parse(ctx) || {};
        result.dateBucket = mode === 'category-day' ? 'day' : 'month';
        return result;
    }
  }
  return AnimeArchiveParser.parse(ctx);
};
