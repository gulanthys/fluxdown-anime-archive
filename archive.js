globalThis.archive = function (ctx) {
  if (!ctx || ctx.categoryRouting !== true) {
    throw new Error('Anime Archive requires a newer FluxDown host with archive category-routing support.');
  }
  if (!['start', 'complete'].includes(ctx.phase) || typeof ctx.createdDate !== 'string' || !/^(?:\d{4}-\d{2}-\d{2})?$/.test(ctx.createdDate)) {
    throw new Error('Anime Archive requires the FluxDown 0.6.5 archive context (phase, createdDate and completion content detection).');
  }
  return AnimeArchiveParser.parse(ctx);
};
