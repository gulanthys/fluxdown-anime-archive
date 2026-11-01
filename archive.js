globalThis.archive = function (ctx) {
  const settings = flux.settings || {};
  return AnimeArchiveParser.parse(ctx && ctx.fileName, Object.assign({}, settings, {
    metadata: ctx && ctx.metadata || null,
    isGroup: !!(ctx && ctx.isGroup)
  }));
};
