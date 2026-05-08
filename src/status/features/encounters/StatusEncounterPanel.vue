<script setup lang="ts">
import { computed, ref } from 'vue';
import type { RawStatusData } from '../../types/status';
import { buildEncounterProfiles } from './encounter-presenters';
import StatusEncounterCard from './StatusEncounterCard.vue';

interface Props {
  statusData: RawStatusData;
}

const props = defineProps<Props>();
const activeId = ref<string | null>(null);

const profiles = computed(() => buildEncounterProfiles(props.statusData));

const toggleProfile = (id: string) => {
  activeId.value = activeId.value === id ? null : id;
};
</script>

<template>
  <section class="status-encounter" aria-label="邂逅名录内容">
    <div class="status-encounter__summary">
      <span class="status-encounter__summary-title">邂逅名录</span>
      <span class="status-encounter__summary-count">{{
        profiles.length > 0 ? `${profiles.length} 人` : '暂无记录'
      }}</span>
    </div>

    <div v-if="profiles.length > 0" class="status-encounter__list">
      <StatusEncounterCard
        v-for="profile in profiles"
        :key="profile.id"
        :profile="profile"
        :expanded="activeId === profile.id"
        @toggle="toggleProfile"
      />
    </div>

    <p v-else class="status-encounter__empty">暂无邂逅之人。当命运的丝线交汇时，TA们的档案会记录于此。</p>
  </section>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-encounter {
  @apply flex max-h-full min-h-0 w-full flex-col gap-2.5 overflow-hidden;
}

.status-encounter__summary {
  @apply flex min-w-0 shrink-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2.5 py-2 text-xs;
  color: var(--status-theme-muted);
  background-color: var(--status-theme-soft);
}

.status-encounter__summary-title {
  @apply font-semibold;
  color: var(--status-theme-text);
}

.status-encounter__summary-count {
  @apply text-[10px];
}

.status-encounter__list {
  @apply flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto pr-1;
  scrollbar-width: thin;
  scrollbar-color: var(--status-theme-soft) transparent;
}

.status-encounter__empty {
  @apply m-0 rounded-md px-2 py-1.5 text-xs italic;
  color: var(--status-theme-muted);
  background-color: color-mix(in srgb, var(--status-theme-soft) 42%, transparent);
}

@media screen and (max-width: 420px) {
  .status-encounter {
    @apply gap-2;
  }

  .status-encounter__summary {
    @apply px-2 py-1.5;
  }
}
</style>
