const MIO_STABILIZER_PATH = '主要角色.澪.注入星尘稳定剂';
const MIO_HEALING_PROGRESS_PATH = '主要角色.澪.治愈进度';
const MIO_STABILIZED_HEALING_PROGRESS = 90;

/**
 * 处理澪的星尘稳定剂注入相关逻辑
 * @param stat_data - stat_data对象
 */
export function handleMioStabilizer(stat_data: Record<string, any>): void {
  if (_.get(stat_data, MIO_STABILIZER_PATH) !== true) {
    return;
  }

  if (_.get(stat_data, MIO_HEALING_PROGRESS_PATH) === MIO_STABILIZED_HEALING_PROGRESS) {
    return;
  }

  console.log(`澪已注入星尘稳定剂，治愈进度固定为 ${MIO_STABILIZED_HEALING_PROGRESS}`);
  _.set(stat_data, MIO_HEALING_PROGRESS_PATH, MIO_STABILIZED_HEALING_PROGRESS);
}
