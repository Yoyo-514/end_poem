import { Schema } from '../../var_zod_schema/schema';
import { StatusMapParser } from '../features/map/status-map-parser';
import type { StatusMapData } from '../types/map';
import type { RawStatusData, StatusSnapshot, StatusTabItem } from '../types/status';

const DEFAULT_STATUS_DATA: RawStatusData = Schema().parse({});

const STATUS_TABS: StatusTabItem[] = [
  {
    id: 'tasks',
    label: '任务列表',
  },
  {
    id: 'overview',
    label: '旅途记录',
  },
  {
    id: 'companions',
    label: '旅行同伴',
  },
  {
    id: 'encounters',
    label: '邂逅之人',
  },
  {
    id: 'map',
    label: '地图',
  },
];

/**
 * 状态数据服务
 * 只负责从最后一条 assistant 消息变量中读取并规整状态面板需要的数据。
 */
export class StatusDataService {
  private static instance: StatusDataService | null = null;
  private cachedSnapshot: StatusSnapshot | null = null;
  private lastReadAt = 0;
  private mvuReady = false;
  private mvuReadyPromise: Promise<void> | null = null;
  private readonly cacheDuration = 800;

  private constructor() {}

  public static getInstance(): StatusDataService {
    this.instance ??= new StatusDataService();
    return this.instance;
  }

  public async initialize(): Promise<void> {
    if (this.mvuReady) {
      return;
    }

    this.mvuReadyPromise ??= waitGlobalInitialized('Mvu')
      .then(() => {
        this.mvuReady = true;
        console.info('[StatusPanel] MVU 已初始化，开始读取状态数据');
      })
      .catch(error => {
        this.mvuReadyPromise = null;
        console.warn('[StatusPanel] 等待 MVU 初始化失败:', error);
      });

    await this.mvuReadyPromise;
  }

  public getEmptySnapshot(activeTabId: StatusTabItem['id'] = 'tasks'): StatusSnapshot {
    return this.toSnapshot(DEFAULT_STATUS_DATA, null, activeTabId, false);
  }

  public getSnapshot(activeTabId: StatusTabItem['id'] = 'tasks'): StatusSnapshot {
    const now = Date.now();
    if (this.cachedSnapshot && now - this.lastReadAt < this.cacheDuration) {
      return {
        ...this.cachedSnapshot,
        activeTabId,
      };
    }

    const latestAssistantMessage = this.getLatestAssistantMessage();
    const rawStatusData = latestAssistantMessage ? this.readRawStatusData(latestAssistantMessage) : null;
    const mapData = latestAssistantMessage ? this.readMapData(latestAssistantMessage) : null;
    const snapshot = this.toSnapshot(
      rawStatusData ?? DEFAULT_STATUS_DATA,
      mapData,
      activeTabId,
      Boolean(rawStatusData),
      now,
    );

    this.cachedSnapshot = snapshot;
    this.lastReadAt = now;
    return snapshot;
  }

  public clearCache(): void {
    this.cachedSnapshot = null;
    this.lastReadAt = 0;
  }

  private toSnapshot(
    statusData: RawStatusData,
    mapData: StatusMapData | null,
    activeTabId: StatusTabItem['id'],
    isAvailable: boolean,
    updatedAt = Date.now(),
  ): StatusSnapshot {
    return {
      statusData,
      mapData,
      tabs: STATUS_TABS,
      activeTabId,
      isAvailable,
      updatedAt,
    };
  }

  private readRawStatusData(latestAssistantMessage: ChatMessage): RawStatusData | null {
    try {
      console.info('[StatusPanel] 开始读取状态数据');

      if (!this.mvuReady) {
        console.info('[StatusPanel] MVU 尚未初始化，跳过本次状态数据读取');
        return null;
      }

      const variables = Mvu.getMvuData({
        type: 'message',
        message_id: latestAssistantMessage.message_id,
      });
      const rawStatusData = _.get(variables, 'stat_data', null) as RawStatusData | null;
      console.info('[StatusPanel] 已读取最新 assistant 消息 MVU 变量:', {
        message_id: latestAssistantMessage.message_id,
        hasStatData: Boolean(rawStatusData),
        variables,
      });

      if (!rawStatusData) {
        console.info('[StatusPanel] 最新 assistant 消息变量中不存在 stat_data');
      }

      return rawStatusData;
    } catch (error) {
      console.warn('[StatusPanel] 读取状态数据失败:', error);
      return null;
    }
  }

  private readMapData(latestAssistantMessage: ChatMessage): StatusMapData | null {
    const mapText = StatusMapParser.extractMapText(latestAssistantMessage.message);
    if (!mapText) {
      return null;
    }

    return StatusMapParser.parseMapText(mapText);
  }

  private getLatestAssistantMessage(): ChatMessage | null {
    const messages = getChatMessages('0-{{lastMessageId}}', {
      role: 'assistant',
      hide_state: 'all',
      include_swipes: false,
    });

    console.info('[StatusPanel] assistant 消息扫描完成:', {
      count: messages.length,
      latestMessageId: _.last(messages)?.message_id ?? null,
    });

    return _.last(messages) ?? null;
  }
}
