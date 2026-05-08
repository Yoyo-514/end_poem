<script setup lang="ts">
import type { StatusGlobalInfo } from '../types/status';

interface Props {
  globalInfo: StatusGlobalInfo;
  isAvailable: boolean;
}

defineProps<Props>();
</script>

<template>
  <header class="status-header" :class="{ 'status-header--unavailable': !isAvailable }">
    <div class="status-header__time-row" aria-label="日期与时间">
      <span class="status-header__date">{{ globalInfo.日期 }}</span>
      <span class="status-header__time">{{ globalInfo.时间 }}</span>
    </div>

    <div class="status-header__info-row" aria-label="当前位置">
      <i class="status-header__icon fas fa-location-dot" aria-hidden="true"></i>
      <span class="status-header__text">{{ globalInfo.当前位置 }}</span>
    </div>

    <div class="status-header__info-row" aria-label="天气">
      <i class="status-header__icon fas fa-cloud" aria-hidden="true"></i>
      <span class="status-header__text">{{ globalInfo.天气 }}</span>
    </div>
  </header>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-header {
  @apply flex min-w-0 flex-col gap-1.5 pr-7;
}

.status-header--unavailable {
  @apply opacity-75;
}

.status-header__time-row {
  @apply flex min-w-0 items-baseline gap-2;
}

.status-header__date,
.status-header__time {
  @apply min-w-0 text-sm font-semibold leading-tight;
  color: var(--status-theme-text);
}

.status-header__date {
  @apply truncate;
}

.status-header__time {
  @apply shrink-0 tabular-nums;
}

.status-header__info-row {
  @apply flex min-w-0 items-start gap-2 text-xs leading-snug;
  color: var(--status-theme-muted);
}

.status-header__icon {
  @apply mt-0.5 w-3 shrink-0 text-center text-[11px] leading-none;
  color: var(--status-theme);
}

.status-header__text {
  @apply min-w-0 break-words;
  overflow-wrap: anywhere;
}
</style>
