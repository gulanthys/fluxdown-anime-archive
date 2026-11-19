globalThis.archive = function (ctx) {
  if (!ctx || ctx.categoryRouting !== true) {
    throw new Error('文件分类归档需要支持内置分类路由的 FluxDown 宿主。');
  }
  if (!['start', 'complete'].includes(ctx.phase) || typeof ctx.createdDate !== 'string' || !/^(?:\d{4}-\d{2}-\d{2})?$/.test(ctx.createdDate)) {
    throw new Error('文件分类归档需要 FluxDown 0.6.5 的归档上下文。');
  }
  if (ctx.completedDate && ctx.phase === 'complete' && !ctx.isGroup) {
    switch (flux.settings.archiveMode) {
      case 'day': return { dateBucket: 'day' };
      case 'month': return { dateBucket: 'month' };
      case 'category-day':
        return { ...AnimeArchiveParser.parse(ctx), dateBucket: 'day' };
      case 'category-month':
        return { ...AnimeArchiveParser.parse(ctx), dateBucket: 'month' };
    }
  }
  return AnimeArchiveParser.parse(ctx);
};
