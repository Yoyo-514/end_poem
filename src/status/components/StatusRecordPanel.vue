<script setup lang="ts">
import { computed } from 'vue';
import type { StatusAnomalyMap, StatusPlotRecord, StatusTemporaryInfo } from '../types/status';
import { formatPlotProgress } from '../utils/formatters';

interface Props {
  plotRecord: StatusPlotRecord;
  temporaryInfo: StatusTemporaryInfo;
  anomalies: StatusAnomalyMap;
}

const props = defineProps<Props>();

const significantImpacts = computed(() => _.toPairs(props.plotRecord.significant_impact));
const temporaryEntries = computed(() => _.toPairs(props.temporaryInfo));
const anomalies = computed(() => _.toPairs(props.anomalies));
</script>

<template>
  <section class="status-record" aria-label="旅途记录内容">
    <div class="status-record__progress" aria-label="剧情进度">
      <i class="status-record__icon fas fa-route" aria-hidden="true"></i>
      <span class="status-record__progress-label">当前进度</span>
      <span class="status-record__progress-value">{{ formatPlotProgress(plotRecord.剧情进度) }}</span>
    </div>

    <div class="status-record__lists">
      <div class="status-record__section">
        <div class="status-record__section-title">
          <i class="status-record__icon fas fa-bolt" aria-hidden="true"></i>
          <span>重要影响</span>
          <span class="status-record__section-meta">
            {{ significantImpacts.length > 0 ? `${significantImpacts.length} 项影响` : '暂无影响' }}
          </span>
        </div>

        <div v-if="significantImpacts.length > 0" class="status-record__impact-list">
          <article v-for="[title, description] in significantImpacts" :key="title" class="status-record__impact-item">
            <span class="status-record__impact-title">{{ title }}</span>
            <span class="status-record__impact-desc">{{ description }}</span>
          </article>
        </div>

        <p v-else class="status-record__empty">暂无重要影响记录。</p>
      </div>

      <div class="status-record__section">
        <div class="status-record__section-title">
          <i class="status-record__icon fas fa-wave-square" aria-hidden="true"></i>
          <span>异常记录</span>
          <span class="status-record__section-meta">
            {{ anomalies.length > 0 ? `${anomalies.length} 项异常` : '暂无异常' }}
          </span>
        </div>

        <div v-if="anomalies.length > 0" class="status-record__anomaly-list">
          <article v-for="[type, description] in anomalies" :key="type" class="status-record__anomaly-item">
            <span class="status-record__anomaly-type">{{ type }}</span>
            <span class="status-record__anomaly-desc">{{ description }}</span>
          </article>
        </div>

        <p v-else class="status-record__empty">未检测到异常记录。</p>
      </div>

      <div class="status-record__section">
        <div class="status-record__section-title">
          <i class="status-record__icon fas fa-box-archive" aria-hidden="true"></i>
          <span>暂存信息</span>
          <span class="status-record__section-meta">
            {{ temporaryEntries.length > 0 ? `${temporaryEntries.length} 项暂存` : '暂无暂存' }}
          </span>
        </div>

        <div v-if="temporaryEntries.length > 0" class="status-record__temporary-list">
          <article v-for="[title, info] in temporaryEntries" :key="title" class="status-record__temporary-item">
            <span class="status-record__temporary-title">{{ title }}</span>
            <span class="status-record__temporary-content">{{ info.内容 || '暂无内容' }}</span>
            <span class="status-record__temporary-condition"
              >移除条件：{{ info.移除条件 || '剧情不再需要时删除' }}</span
            >
          </article>
        </div>

        <p v-else class="status-record__empty">暂无暂存信息。</p>
      </div>

      <div class="status-record__section">
        <div class="status-record__section-title">
          <i class="status-record__icon fas fa-scroll" aria-hidden="true"></i>
          <span>剧情节点</span>
        </div>

        <ol v-if="plotRecord.剧情节点记录.length > 0" class="status-record__node-list">
          <li
            v-for="(node, index) in plotRecord.剧情节点记录"
            :key="`${index}-${node}`"
            class="status-record__node-item"
          >
            <span class="status-record__node-index">{{ index + 1 }}</span>
            <span class="status-record__node-text">{{ node }}</span>
          </li>
        </ol>

        <p v-else class="status-record__empty">暂无剧情节点记录。</p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-record {
  @apply flex max-h-full min-h-0 w-full overflow-hidden flex-col gap-2.5;
}

.status-record__progress {
  @apply flex min-w-0 shrink-0 items-center gap-2 rounded-md px-2.5 py-2 text-xs;
  color: var(--status-theme-muted);
  background-color: var(--status-theme-soft);
}

.status-record__progress-label {
  @apply shrink-0;
}

.status-record__progress-value {
  @apply min-w-0 truncate font-semibold tabular-nums;
  color: var(--status-theme-text);
}

.status-record__lists {
  @apply flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-1;
  scrollbar-width: thin;
  scrollbar-color: var(--status-theme-soft) transparent;
}

.status-record__icon {
  @apply w-3 shrink-0 text-center text-[11px] leading-none;
  color: var(--status-theme);
}

.status-record__section {
  @apply flex min-w-0 shrink-0 flex-col border-t pt-2.5;
  border-color: var(--status-theme-soft);
}

.status-record__section-title {
  @apply mb-2 flex min-w-0 shrink-0 items-center gap-2 text-xs font-semibold;
  color: var(--status-theme-text);
}

.status-record__section-meta {
  @apply ml-auto shrink-0 text-[10px] font-normal;
  color: var(--status-theme-muted);
}

.status-record__impact-list,
.status-record__temporary-list,
.status-record__anomaly-list,
.status-record__node-list {
  @apply m-0 flex list-none flex-col gap-1.5 p-0;
}

.status-record__impact-item,
.status-record__temporary-item,
.status-record__anomaly-item,
.status-record__node-item {
  @apply min-w-0 rounded-md px-2 py-1.5 text-xs;
  background-color: color-mix(in srgb, var(--status-theme-soft) 42%, transparent);
}

.status-record__impact-item,
.status-record__temporary-item,
.status-record__anomaly-item {
  @apply grid gap-1;
}

.status-record__impact-title,
.status-record__temporary-title,
.status-record__anomaly-type {
  @apply font-semibold;
  color: var(--status-theme-text);
}

.status-record__impact-desc,
.status-record__temporary-content,
.status-record__temporary-condition,
.status-record__anomaly-desc,
.status-record__node-text,
.status-record__empty {
  @apply break-words text-xs leading-snug;
  color: var(--status-theme-muted);
  overflow-wrap: anywhere;
}

.status-record__temporary-condition {
  @apply text-[10px];
}

.status-record__node-item {
  @apply flex gap-2;
}

.status-record__node-index {
  @apply flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums;
  color: var(--status-theme-panel-solid);
  background-color: var(--status-theme);
}

.status-record__empty {
  @apply m-0 min-h-0 italic;
}

@media screen and (max-width: 420px) {
  .status-record {
    @apply gap-2;
  }

  .status-record__progress {
    @apply px-2 py-1.5;
  }

  .status-record__lists {
    @apply gap-2;
  }

  .status-record__section {
    @apply pt-2;
  }
}
</style>
