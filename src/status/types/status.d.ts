import type { Schema as StatusSchema } from '../../var_zod_schema/schema';
import type { StatusMapData } from './map';

export type RawStatusData = StatusSchema;
export type StatusGlobalInfo = StatusSchema['全局信息'];
export type StatusPlotRecord = StatusSchema['plot_record'];
export type StatusTaskList = StatusSchema['任务列表'];
export type StatusTaskEntry = StatusTaskList[string];
export type StatusTemporaryInfo = StatusSchema['暂存信息'];
export type StatusPrimaryCharacters = StatusSchema['主要角色'];
export type StatusSpecialCharacters = StatusSchema['特殊角色'];
export type StatusSecondaryCharacters = StatusSchema['次要角色'];
export type StatusAnomalyMap = StatusGlobalInfo['异常'];
export type StatusSignificantImpactMap = StatusPlotRecord['significant_impact'];

export interface StatusPanelMountOptions {
  containerId: string;
}

export interface StatusTabItem {
  id: 'tasks' | 'overview' | 'companions' | 'encounters' | 'map';
  label: string;
}

export interface StatusSnapshot {
  statusData: RawStatusData;
  mapData: StatusMapData | null;
  tabs: StatusTabItem[];
  activeTabId: StatusTabItem['id'];
  isAvailable: boolean;
  updatedAt: number;
}
