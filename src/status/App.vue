<script setup lang="ts">
import { ref } from 'vue';
import StatusHeader from './components/StatusHeader.vue';
import StatusRecordPanel from './components/StatusRecordPanel.vue';
import StatusTabs from './components/StatusTabs.vue';
import StatusTaskPanel from './components/StatusTaskPanel.vue';
import { useStatusPanel } from './composables/useStatusPanel';
import StatusCompanionPanel from './features/companions/StatusCompanionPanel.vue';
import StatusEncounterPanel from './features/encounters/StatusEncounterPanel.vue';
import StatusMapPanel from './features/map/StatusMapPanel.vue';

const expanded = ref(false);
const { statusData, mapData, activeTab, activeTabId, isAvailable, setActiveTab, tabs } = useStatusPanel();

const openPanel = () => {
  expanded.value = true;
};

const closePanel = () => {
  expanded.value = false;
};
</script>

<template>
  <section class="status-float" aria-label="终末之诗状态面板">
    <button v-if="!expanded" class="status-float__handle" type="button" aria-label="展开状态面板" @click="openPanel">
      <i class="status-float__handle-icon fas fa-scroll" aria-hidden="true"></i>
    </button>

    <div v-else class="status-float__panel">
      <button class="status-float__close" type="button" aria-label="收起状态面板" @click="closePanel">
        <i class="fas fa-xmark" aria-hidden="true"></i>
      </button>
      <StatusHeader :global-info="statusData.全局信息" :is-available="isAvailable" />
      <StatusTabs class="status-float__tabs" :tabs="tabs" :active-tab-id="activeTabId" @change="setActiveTab" />

      <main class="status-float__content" :aria-label="activeTab?.label ?? '状态内容'">
        <StatusTaskPanel v-if="activeTabId === 'tasks'" :task-list="statusData.任务列表" />
        <StatusRecordPanel
          v-else-if="activeTabId === 'overview'"
          :plot-record="statusData.plot_record"
          :temporary-info="statusData.暂存信息"
          :anomalies="statusData.全局信息.异常"
        />
        <StatusCompanionPanel v-else-if="activeTabId === 'companions'" :status-data="statusData" />
        <StatusEncounterPanel v-else-if="activeTabId === 'encounters'" :status-data="statusData" />
        <StatusMapPanel v-else-if="activeTabId === 'map'" :map-data="mapData" />
        <div v-else class="status-float__empty">
          <p class="status-float__empty-title">{{ activeTab?.label ?? '状态内容' }}</p>
          <p class="status-float__empty-hint">内容区域预留，等待后续面板布局接入。</p>
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use './styles/theme';
@reference "tailwindcss";

.status-float,
.status-float *,
.status-float *::before,
.status-float *::after {
  @apply box-border;
}

.status-float {
  @include theme.status-theme-tokens;

  @apply absolute left-0 flex items-end text-xs leading-normal;
  bottom: calc(66px + 12px);
  z-index: 999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
}

.status-float__handle {
  @apply flex h-10 w-7 translate-x-[-4px] cursor-pointer items-center justify-center rounded-r-xl border-0 p-0 transition-transform duration-200 ease-out;
  color: var(--status-theme-text);
  background-color: var(--status-theme-glass-strong);
  backdrop-filter: blur(4px) saturate(108%);
  -webkit-backdrop-filter: blur(4px) saturate(108%);
  box-shadow:
    inset 0 0 0 1px var(--status-theme),
    inset 0 0 10px var(--status-theme-soft),
    0 4px 12px var(--status-theme-shadow);

  &:hover {
    @apply translate-x-0;
    color: var(--status-theme-panel-solid);
    background-color: var(--status-theme);
  }
}

.status-float__handle-icon {
  @apply text-sm leading-none;
}

.status-float__panel {
  @apply ml-4 flex max-h-[70vh] min-h-0 w-[560px] flex-col gap-2.5 overflow-hidden rounded-xl border p-3.5;
  color: var(--status-theme-text);
  border-color: var(--status-theme-soft);
  background-color: var(--status-theme-glass);
  backdrop-filter: blur(12px) saturate(110%);
  -webkit-backdrop-filter: blur(12px) saturate(110%);
  box-shadow:
    inset 0 0 0 1px var(--status-theme-soft),
    inset 0 0 14px var(--status-theme-soft),
    0 8px 20px var(--status-theme-shadow);
}

.status-float__close {
  @apply absolute right-2 top-2 z-10 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 p-0 text-sm leading-none;
  color: var(--status-theme-text);
  background-color: var(--status-theme-soft);

  &:hover {
    color: var(--status-theme-panel-solid);
    background-color: var(--status-theme);
  }
}

.status-float__tabs {
  @apply shrink-0;
}

.status-float__content {
  @apply flex min-h-0 min-w-0 flex-[1_1_auto] overflow-hidden rounded-lg px-1 py-2;
}

.status-float__empty {
  @apply min-w-0;
}

.status-float__empty-title {
  @apply m-0 text-sm font-semibold;
  color: var(--status-theme-text);
}

.status-float__empty-hint {
  @apply mb-0 mt-1 text-xs;
  color: var(--status-theme-muted);
}

@media screen and (max-width: 768px) {
  .status-float {
    @apply bottom-auto items-start;
    top: calc(20% + 12px);
  }

  .status-float__panel {
    @apply ml-3 max-h-[calc(80vh-24px)] w-[calc(100vw-24px)] p-3;
  }
}

@media screen and (max-width: 420px) {
  .status-float__panel {
    @apply gap-2;
  }

  .status-float__content {
    @apply px-0.5 py-1.5;
  }
}
</style>
