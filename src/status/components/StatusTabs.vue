<script setup lang="ts">
import type { StatusTabItem } from '../types/status';

interface Props {
  tabs: StatusTabItem[];
  activeTabId: StatusTabItem['id'];
}

interface Emits {
  (event: 'change', tabId: StatusTabItem['id']): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<template>
  <nav class="status-tabs" aria-label="状态面板分页">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="status-tabs__item"
      :class="{ 'status-tabs__item--active': tab.id === activeTabId }"
      type="button"
      @click="$emit('change', tab.id)"
    >
      <span class="status-tabs__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-tabs {
  @apply flex min-w-0 gap-1.5 overflow-x-auto pb-0.5;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    @apply hidden;
  }
}

.status-tabs__item {
  @apply relative shrink-0 cursor-pointer rounded-full border-0 px-3 py-1.5 text-left text-xs font-medium transition-colors duration-200;
  color: var(--status-theme-muted);
  background-color: transparent;

  &::after {
    @apply absolute bottom-0 left-3 right-3 h-px scale-x-0 transition-transform duration-200 content-[''];
    background-color: var(--status-theme);
  }
}

.status-tabs__item:hover,
.status-tabs__item--active {
  color: var(--status-theme-text);
  background-color: var(--status-theme-soft);
}

.status-tabs__item--active::after {
  @apply scale-x-100;
}

.status-tabs__label {
  @apply block whitespace-nowrap leading-none;
}
</style>
