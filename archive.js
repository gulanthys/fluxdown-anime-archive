globalThis.archive = function (ctx) {
  if (!ctx || ctx.categoryRouting !== true) {
    throw new Error('文件分类归档需要支持内置分类路由的 FluxDown 宿主。');
  }
  if (!['start', 'complete'].includes(ctx.phase) || typeof ctx.createdDate !== 'string' || !/^(?:\d{4}-\d{2}-\d{2})?$/.test(ctx.createdDate)) {
    throw new Error('文件分类归档需要 FluxDown 0.6.5 的归档上下文。');
  }
  return AnimeArchiveParser.parse(ctx);
};
