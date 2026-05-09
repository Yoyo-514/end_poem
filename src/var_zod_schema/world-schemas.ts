import { SECONDARY_CHAR_NAMES } from './constants';
import { clampedNum, filterZeroQuantityItems, itemSchema, uniqueStrArray } from './utils';

const TemporaryInfoSchema = z
  .record(
    z.string(),
    z
      .object({
        内容: z.string().prefault(''),
        移除条件: z.string().prefault('剧情不再需要时删除'),
      })
      .prefault({}),
  )
  .prefault({});

export const GlobalInfoSchema = z
  .object({
    日期: z
      .templateLiteral(['终焉纪元', z.coerce.number(), '年', z.coerce.number(), '月', z.coerce.number(), '日'])
      .prefault('终焉纪元210年8月8日'),
    时间: z.templateLiteral([z.coerce.number(), ':', z.coerce.number()]).prefault('0:0'),
    当前位置: z.string().prefault(''),
    天气: z.string().prefault(''),
    异常: z.record(z.string(), z.string()).prefault({}),
  })
  .prefault({});

export const PlotRecordSchema = z
  .object({
    剧情进度: z.templateLiteral(['v', z.coerce.number(), 's', z.coerce.number()]).prefault('v1s1'),
    剧情节点记录: uniqueStrArray(),
    significant_impact: z.record(z.string(), z.string()).prefault({}),
  })
  .prefault({});

export const TaskListSchema = z
  .record(
    z.string(),
    z
      .object({
        goal: z.string().prefault(''),
        next: z.string().prefault(''),
        reward: z.string().prefault(''),
        status: z.enum(['进行中', '已完成', '失败', '搁置']).prefault('进行中'),
      })
      .prefault({}),
  )
  .prefault({});

export const TemporaryPlotInfoSchema = TemporaryInfoSchema;

export const SecondaryCharactersSchema = z
  .record(
    z.string(),
    z
      .object({
        身份: z.string().prefault(''),
        信任值: clampedNum(0.01, -1, 1),
        外观: z.string().prefault(''),
        姿态动作: z.string().prefault(''),
        持有物品: z.record(z.string(), itemSchema).prefault({}).transform(filterZeroQuantityItems),
        能力: z.record(z.string(), z.string()).prefault({}),
      })
      .prefault({}),
  )
  .transform(obj => {
    const allowedKeys = _.keys(obj).filter(key => _.includes(SECONDARY_CHAR_NAMES, key));
    const removedKeys = _.difference(_.keys(obj), allowedKeys);

    if (!_.isEmpty(removedKeys)) {
      console.log(`[次要角色限制] 检测到不允许的角色，已移除: ${removedKeys.join(', ')}`);
    }

    return _.pick(obj, allowedKeys);
  })
  .prefault({});
