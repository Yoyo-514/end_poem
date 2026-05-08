import { createPrimaryCharactersSchema, SpecialCharactersSchema } from './character-schemas';
import {
  GlobalInfoSchema,
  PlotRecordSchema,
  SecondaryCharactersSchema,
  TaskListSchema,
  TemporaryPlotInfoSchema,
} from './world-schemas';

// 主 Schema 定义

export const Schema = () =>
  z.object({
    全局信息: GlobalInfoSchema,

    plot_record: PlotRecordSchema,

    任务列表: TaskListSchema,

    暂存信息: TemporaryPlotInfoSchema,

    主要角色: createPrimaryCharactersSchema(),

    特殊角色: SpecialCharactersSchema,

    次要角色: SecondaryCharactersSchema,

    次要角色记录: z.record(z.string(), z.any()).prefault({}),

    _internal: z.record(z.any(), z.any()).optional(),
  });

export type Schema = z.output<ReturnType<typeof Schema>>;
