const PLOT_PROGRESS_PATH = 'plot_record.剧情进度';
const PLOT_NODE_RECORD_PATH = 'plot_record.剧情节点记录';
const PLOT_PROGRESS_VOLUME_PATTERN = /^v(\d+)s\d+$/;

function getPlotVolume(progress: unknown): string | undefined {
  if (typeof progress !== 'string') {
    return undefined;
  }

  return progress.match(PLOT_PROGRESS_VOLUME_PATTERN)?.[1];
}

/**
 * 处理剧情进度变更
 * @param variables - 更新后的变量数据
 * @param variablesBeforeUpdate - 更新前的变量数据
 */
export function handlePlotProgress(variables: Mvu.MvuData, variablesBeforeUpdate: Mvu.MvuData): void {
  if (!variables?.stat_data || !variablesBeforeUpdate?.stat_data) {
    return;
  }

  const oldProgress = _.get(variablesBeforeUpdate.stat_data, PLOT_PROGRESS_PATH);
  const newProgress = _.get(variables.stat_data, PLOT_PROGRESS_PATH);

  if (oldProgress === newProgress) {
    return;
  }

  console.log(`剧情进度从 "${oldProgress}" 变更为 "${newProgress}"`);

  const oldVolume = getPlotVolume(oldProgress);
  const newVolume = getPlotVolume(newProgress);

  if (oldVolume === newVolume) {
    return;
  }

  // 卷数变化时清空剧情节点记录
  if (_.has(variables.stat_data, PLOT_NODE_RECORD_PATH)) {
    _.set(variables.stat_data, PLOT_NODE_RECORD_PATH, []);
    console.log('已清空剧情节点记录');
  }
}
