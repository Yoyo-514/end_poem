import { createScriptIdDiv, teleportStyle } from '@/src/utils/sctipt';
import { createPinia } from 'pinia';
import type { App as VueApp } from 'vue';
import { createApp } from 'vue';
import StatusApp from './App.vue';

/**
 * 状态面板脚本管理器
 * 负责 Vue 面板在酒馆页面中的挂载、样式传送与生命周期清理。
 */
class StatusPanelManager {
  private static instance: StatusPanelManager | null = null;
  private app: VueApp | null = null;
  private container: JQuery<HTMLDivElement> | null = null;
  private styleTeleport: { destroy: () => void } | null = null;

  private constructor() {}

  public static getInstance(): StatusPanelManager {
    this.instance ??= new StatusPanelManager();
    return this.instance;
  }

  public mount = _.once((): void => {
    try {
      this.cleanup();
      this.container = createScriptIdDiv().attr('id', 'end-poem-status-panel').appendTo('body');

      this.app = createApp(StatusApp);
      this.app.use(createPinia());
      this.app.mount(this.container[0]);

      this.styleTeleport = teleportStyle($('head', window.parent.document));

      console.info('[StatusPanel] 状态面板已挂载');
    } catch (error) {
      console.error('[StatusPanel] 状态面板挂载失败:', error);
    }
  });

  public cleanup(): void {
    this.app?.unmount();
    this.container?.remove();
    this.styleTeleport?.destroy();

    this.app = null;
    this.container = null;
    this.styleTeleport = null;
  }
}

const manager = StatusPanelManager.getInstance();

$(() => {
  manager.mount();
  $(window).on('pagehide.status-panel', () => manager.cleanup());
});
