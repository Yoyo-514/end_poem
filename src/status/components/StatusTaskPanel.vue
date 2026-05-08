<script setup lang="ts">
import { computed } from 'vue';
import type { StatusTaskList } from '../types/status';

interface Props {
  taskList: StatusTaskList;
}

const props = defineProps<Props>();

const tasks = computed(() => _.toPairs(props.taskList));

const taskStatusCounts = computed(() => {
  const statusOrder = ['进行中', '已完成', '失败', '搁置'];
  return statusOrder
    .map(status => ({
      status,
      count: tasks.value.filter(([, task]) => task.status === status).length,
    }))
    .filter(item => item.count > 0);
});
</script>

<template>
  <section class="status-task" aria-label="任务列表内容">
    <div class="status-task__summary" aria-label="任务状态统计">
      <span class="status-task__summary-total">{{ tasks.length > 0 ? `${tasks.length} 项` : '暂无任务' }}</span>
      <span v-for="item in taskStatusCounts" :key="item.status" class="status-task__summary-item">
        {{ item.status }} {{ item.count }}
      </span>
    </div>

    <div v-if="tasks.length > 0" class="status-task__list">
      <article v-for="[title, task] in tasks" :key="title" class="status-task__card">
        <header class="status-task__card-header">
          <span class="status-task__card-title">{{ title }}</span>
          <span class="status-task__status">{{ task.status || '进行中' }}</span>
        </header>

        <div class="status-task__body">
          <p class="status-task__line">
            <span class="status-task__label">目标</span>
            <span class="status-task__value">{{ task.goal || '暂无' }}</span>
          </p>
          <p class="status-task__line">
            <span class="status-task__label">下一步</span>
            <span class="status-task__value">{{ task.next || '暂无' }}</span>
          </p>
          <p class="status-task__line">
            <span class="status-task__label">报酬</span>
            <span class="status-task__value">{{ task.reward || '暂无' }}</span>
          </p>
        </div>
      </article>
    </div>

    <p v-else class="status-task__empty">暂无任务记录。</p>
  </section>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-task {
  @apply flex max-h-full min-h-0 w-full flex-col gap-2.5 overflow-hidden;
}

.status-task__summary {
  @apply flex min-w-0 shrink-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2.5 py-2 text-xs;
  color: var(--status-theme-muted);
  background-color: var(--status-theme-soft);
}

.status-task__summary-total {
  @apply font-semibold;
  color: var(--status-theme-text);
}

.status-task__summary-item {
  @apply text-[10px];
}

.status-task__list {
  @apply flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto pr-1;
  scrollbar-width: thin;
  scrollbar-color: var(--status-theme-soft) transparent;
}

.status-task__card {
  @apply min-w-0 rounded-md px-2.5 py-2 text-xs;
  background-color: color-mix(in srgb, var(--status-theme-soft) 42%, transparent);
}

.status-task__card-header {
  @apply mb-1.5 flex min-w-0 items-center gap-2;
  color: var(--status-theme-text);
}

.status-task__card-title {
  @apply min-w-0 truncate font-semibold;
}

.status-task__status {
  @apply ml-auto shrink-0 text-[10px] font-normal;
  color: var(--status-theme-muted);
}

.status-task__body {
  @apply grid min-w-0 gap-1;
}

.status-task__line {
  @apply m-0 grid min-w-0 grid-cols-[3.25rem_minmax(0,1fr)] gap-1.5 leading-snug;
}

.status-task__label {
  @apply shrink-0 text-[10px] font-medium;
  color: var(--status-theme-muted);
}

.status-task__value,
.status-task__empty {
  @apply min-w-0;
  color: var(--status-theme-text);
  overflow-wrap: anywhere;
}

.status-task__empty {
  @apply m-0 rounded-md px-2 py-1.5 text-xs italic;
  background-color: color-mix(in srgb, var(--status-theme-soft) 42%, transparent);
}

@media screen and (max-width: 420px) {
  .status-task {
    @apply gap-2;
  }

  .status-task__summary {
    @apply px-2 py-1.5;
  }

  .status-task__card {
    @apply px-2 py-1.5;
  }

  .status-task__line {
    @apply grid-cols-[3rem_minmax(0,1fr)] gap-1;
  }
}
</style>
