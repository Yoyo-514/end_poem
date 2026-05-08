export const formatPlotProgress = (plotProgress: string): string => {
  const normalizedProgress = plotProgress.trim().toLowerCase();
  if (!normalizedProgress.startsWith('v')) {
    return plotProgress;
  }

  const chapterText = normalizedProgress.slice(1);
  if (!Number.isFinite(Number(chapterText))) {
    return plotProgress;
  }

  return `第 ${chapterText} 章`;
};
