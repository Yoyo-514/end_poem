import { INTERNAL_KEYS } from './config/constants';
import { detectSecondaryCharacterChanges } from './handlers/character-handler';
import { handlePlotProgress } from './handlers/plot-handler';
import { handleMioStabilizer } from './handlers/special-handler';
import { applyChangeLimitsFromSnapshot } from './handlers/validation-handler';
import { updateWorldbookScanText } from './handlers/worldbook-handler';

/**
 * 处理MVU变量更新开始事件
 * @param variables - 包含stat_data的变量记录
 */
function variableUpdateStarted(variables: Mvu.MvuData): void {
  console.log('Variable update started');

  // 存储当前次要角色状态用于后续比较（存储在stat_data中确保持久性）
  if (variables?.stat_data) {
    const currentSecondaryCharacters = _.get(variables.stat_data, '次要角色');
    _.set(
      variables.stat_data,
      INTERNAL_KEYS.PREVIOUS_SECONDARY_CHARACTERS_KEY,
      _.cloneDeep(currentSecondaryCharacters),
    );
  }
}

/**
 * 处理MVU变量更新结束事件
 * @param variables - 包含状态和显示相关数据的对象
 * @param variablesBeforeUpdate - 更新前的变量数据
 */
function variableUpdateEnded(variables: Mvu.MvuData, variablesBeforeUpdate: Mvu.MvuData): void {
  console.log('Variable update ended');

  if (variables?.stat_data) {
    // 应用变化幅度限制（在 Zod 验证后执行）
    applyChangeLimitsFromSnapshot(variables.stat_data, variablesBeforeUpdate?.stat_data);

    // 处理特殊角色联动
    handleMioStabilizer(variables.stat_data);

    // 处理剧情进度变更
    handlePlotProgress(variables, variablesBeforeUpdate);

    // 检测次要角色变化
    const currentSecondaryCharacters = _.get(variables.stat_data, '次要角色');
    const previousSecondaryCharacters = _.get(variables.stat_data, INTERNAL_KEYS.PREVIOUS_SECONDARY_CHARACTERS_KEY);

    if (previousSecondaryCharacters && currentSecondaryCharacters) {
      detectSecondaryCharacterChanges(variables.stat_data, previousSecondaryCharacters, currentSecondaryCharacters);
    }

    // 更新存储的状态（存储在stat_data中确保持久性）
    _.set(
      variables.stat_data,
      INTERNAL_KEYS.PREVIOUS_SECONDARY_CHARACTERS_KEY,
      _.cloneDeep(currentSecondaryCharacters),
    );

    // 更新世界书扫描文本
    updateWorldbookScanText(variables.stat_data);
  }
}

// 注册MVU事件监听器
$(() => {
  eventOn(Mvu.events.VARIABLE_UPDATE_STARTED, variableUpdateStarted);
  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, variableUpdateEnded);

  console.log('MVU变量处理脚本已加载');
});
