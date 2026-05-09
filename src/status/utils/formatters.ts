export const formatPlotProgress = (plotProgress: string): string => {
  const match = plotProgress
    .trim()
    .toLowerCase()
    .match(/^v(\d+)s(\d+)$/);

  if (!match) {
    return plotProgress;
  }

  const [, chapter, scene] = match;
  return `第${chapter}章场景${scene}`;
};
