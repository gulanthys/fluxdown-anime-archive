globalThis.archive = function (ctx) {
  const settings = flux.settings || {};
  return AnimeArchiveParser.parse(ctx && ctx.fileName, settings);
};
