<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { StatusMapData, StatusMapEdgeType } from '../../types/map';
import { buildStatusMapGraphData, STATUS_MAP_EDGE_STYLES } from './status-map-presenters';

interface Props {
  mapData: StatusMapData | null;
}

type G6Graph = {
  destroy: () => void;
  render: () => Promise<void> | void;
  resize: (width: number, height: number) => void;
  translateBy: (offset: [number, number], animation?: false | Record<string, unknown>) => Promise<void> | void;
  fitView?: () => Promise<void> | void;
};

interface DragState {
  active: boolean;
  pointerId: number | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLDivElement | null>(null);
const loading = ref(false);
const loadFailed = ref(false);
let graph: G6Graph | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeFrame = 0;
let renderToken = 0;
const dragState: DragState = {
  active: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
};

const hasMap = computed(() => Boolean(props.mapData && props.mapData.nodes.length > 0));
const mapDescription = computed(() => props.mapData?.metadata.description ?? '当前消息未提供地图描述。');
const isDragging = ref(false);

const disposeResizeObserver = () => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = 0;
  }
};

const disposeGraph = () => {
  disposeResizeObserver();
  graph?.destroy();
  graph = null;
};

const getContainerSize = () => {
  const container = containerRef.value;
  if (!container) {
    return null;
  }

  const rect = container.getBoundingClientRect();
  return {
    width: Math.max(Math.floor(rect.width), 320),
    height: Math.max(Math.floor(rect.height), 280),
  };
};

const resizeGraph = () => {
  if (!graph) {
    return;
  }

  const size = getContainerSize();
  if (!size) {
    return;
  }

  graph.resize(size.width, size.height);
};

const scheduleResize = () => {
  if (resizeFrame) {
    cancelAnimationFrame(resizeFrame);
  }

  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resizeGraph();
  });
};

const bindResizeObserver = () => {
  const container = containerRef.value;
  if (!container || resizeObserver) {
    return;
  }

  resizeObserver = new ResizeObserver(scheduleResize);
  resizeObserver.observe(container);
};

const startPan = (event: PointerEvent) => {
  if (!hasMap.value) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  isDragging.value = true;
  dragState.active = true;
  dragState.pointerId = event.pointerId;
  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const movePan = (event: PointerEvent) => {
  if (!dragState.active || dragState.pointerId !== event.pointerId) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const offsetX = event.clientX - dragState.lastX;
  const offsetY = event.clientY - dragState.lastY;
  dragState.lastX = event.clientX;
  dragState.lastY = event.clientY;
  void graph?.translateBy([offsetX, offsetY], false);
};

const endPan = (event: PointerEvent) => {
  if (dragState.pointerId !== event.pointerId) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
  isDragging.value = false;
  dragState.active = false;
  dragState.pointerId = null;
};

const createGraph = async () => {
  const currentToken = ++renderToken;
  await nextTick();

  const container = containerRef.value;
  const mapData = props.mapData;
  const size = getContainerSize();

  disposeGraph();

  if (!container || !mapData || mapData.nodes.length === 0 || !size) {
    return;
  }

  loading.value = true;
  loadFailed.value = false;

  try {
    const { Graph } = await import('@antv/g6');
    if (currentToken !== renderToken) {
      return;
    }

    graph = new Graph({
      container,
      width: size.width,
      height: size.height,
      autoFit: 'view',
      data: buildStatusMapGraphData(mapData),
      node: {
        type: (datum: any) => (datum.data.shape === 'r' ? 'rect' : 'circle'),
        style: {
          x: (datum: any) => datum.style.x,
          y: (datum: any) => datum.style.y,
          size: (datum: any) =>
            datum.data.shape === 'r' ? [datum.data.width, datum.data.height] : datum.data.radius * 2,
          fill: (datum: any) => {
            if (datum.data.current) {
              return 'rgba(250, 204, 21, 0.92)';
            }
            return datum.data.exit ? 'rgba(34, 197, 94, 0.22)' : 'rgba(15, 23, 42, 0.82)';
          },
          stroke: (datum: any) => {
            if (datum.data.current) {
              return 'rgba(254, 243, 199, 1)';
            }
            return datum.data.exit ? 'rgba(74, 222, 128, 0.86)' : 'rgba(125, 211, 252, 0.72)';
          },
          lineWidth: (datum: any) => (datum.data.current ? 2 : 1),
          radius: (datum: any) => (datum.data.shape === 'r' ? 0 : datum.data.radius),
          labelText: (datum: any) => datum.data.label,
          labelPlacement: 'center',
          labelFill: (datum: any) => (datum.data.current ? 'rgba(28, 25, 23, 0.96)' : 'rgba(226, 232, 240, 0.94)'),
          labelFontSize: 10,
          labelFontWeight: 600,
          labelMaxWidth: '90%',
          labelTextOverflow: 'ellipsis',
          labelLineHeight: 13,
          badges: (datum: any) =>
            datum.data.exit
              ? [
                  {
                    text: 'EXIT',
                    placement: 'bottom',
                    offsetX: 0,
                    offsetY: 10,
                    backgroundFill: 'rgba(34, 197, 94, 0.95)',
                    fill: '#ffffff',
                    fontSize: 8,
                    padding: [2, 5],
                    backgroundRadius: 3,
                  },
                ]
              : [],
          halo: (datum: any) => datum.data.current,
          haloStroke: 'rgba(250, 204, 21, 0.3)',
          haloLineWidth: 6,
        },
      },
      edge: {
        style: (datum: any) => {
          const type = (datum.data?.type ?? 'c') as StatusMapEdgeType;
          const style = STATUS_MAP_EDGE_STYLES[type] ?? STATUS_MAP_EDGE_STYLES.c;
          return {
            stroke: style.stroke,
            lineWidth: type === 'c' ? 1.2 : 1.4,
            lineDash: style.lineDash,
            lineOpacity: type === 'c' ? 0.78 : 0.9,
            endArrow: false,
          };
        },
      },
      behaviors: [{ type: 'zoom-canvas', key: 'status-map-zoom-canvas' }],
    });

    await graph.render();
    bindResizeObserver();
    scheduleResize();
  } catch (error) {
    console.warn('[StatusMapPanel] 地图渲染失败:', error);
    loadFailed.value = true;
  } finally {
    if (currentToken === renderToken) {
      loading.value = false;
    }
  }
};

const resetView = async () => {
  resizeGraph();
  await graph?.fitView?.();
};

watch(
  () => props.mapData,
  () => void createGraph(),
  { immediate: true },
);
onBeforeUnmount(() => {
  renderToken += 1;
  disposeGraph();
});
</script>

<template>
  <section class="status-map-panel" aria-label="地图">
    <header class="status-map-panel__header">
      <div class="status-map-panel__title-group">
        <h3 class="status-map-panel__title">{{ mapDescription }}</h3>
      </div>
      <button v-if="hasMap" class="status-map-panel__reset" type="button" @click="resetView">重置视图</button>
    </header>

    <div
      v-if="hasMap"
      class="status-map-panel__graph-shell"
      :class="{ 'status-map-panel__graph-shell--dragging': isDragging }"
      @pointerdown.capture="startPan"
      @pointermove.capture="movePan"
      @pointerup.capture="endPan"
      @pointercancel.capture="endPan"
    >
      <div ref="containerRef" class="status-map-panel__graph"></div>
      <div v-if="loading" class="status-map-panel__overlay">地图加载中...</div>
      <div v-else-if="loadFailed" class="status-map-panel__overlay status-map-panel__overlay--error">地图渲染失败</div>
    </div>

    <div v-if="hasMap" class="status-map-panel__legend" aria-label="地图图例">
      <span class="status-map-panel__legend-item status-map-panel__legend-item--normal">通路</span>
      <span class="status-map-panel__legend-item status-map-panel__legend-item--locked">锁定</span>
      <span class="status-map-panel__legend-item status-map-panel__legend-item--door">门锁</span>
      <span class="status-map-panel__legend-item status-map-panel__legend-item--guard">守卫</span>
      <span class="status-map-panel__legend-item status-map-panel__legend-item--blocked">障碍</span>
      <span class="status-map-panel__legend-item status-map-panel__legend-item--hidden">隐藏</span>
    </div>
    <div v-else class="status-map-panel__empty">
      <p class="status-map-panel__empty-title">暂无地图数据</p>
      <p class="status-map-panel__empty-hint">最新 assistant 消息中未找到 MapGraph 地图块。</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.status-map-panel {
  @apply flex min-h-0 min-w-0 flex-1 flex-col gap-2;
}

.status-map-panel__header {
  @apply flex shrink-0 items-center justify-between gap-2;
}

.status-map-panel__title-group {
  @apply min-w-0;
}

.status-map-panel__title {
  @apply m-0 text-sm font-semibold;
  color: var(--status-theme-text);
}

.status-map-panel__reset {
  @apply shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-semibold;
  color: var(--status-theme-text);
  border-color: var(--status-theme-soft);
  background-color: var(--status-theme-glass-strong);

  &:hover {
    color: var(--status-theme-panel-solid);
    background-color: var(--status-theme);
  }
}

.status-map-panel__graph-shell {
  @apply relative min-h-[280px] min-w-0 flex-1 cursor-grab overflow-hidden rounded-lg border;
  border-color: var(--status-theme-soft);
  background:
    radial-gradient(circle at 20% 20%, rgba(125, 211, 252, 0.12), transparent 30%),
    radial-gradient(circle at 80% 10%, rgba(250, 204, 21, 0.1), transparent 26%), rgba(2, 6, 23, 0.48);
  touch-action: none;
}

.status-map-panel__graph-shell--dragging {
  @apply cursor-grabbing;
}

.status-map-panel__graph {
  @apply h-full min-h-[280px] w-full;
  touch-action: none;
  will-change: transform;
}

.status-map-panel__overlay {
  @apply pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold;
  color: var(--status-theme-muted);
  background-color: rgba(2, 6, 23, 0.42);
}

.status-map-panel__overlay--error {
  color: #fca5a5;
}

.status-map-panel__legend {
  @apply flex shrink-0 flex-wrap gap-1.5 rounded-lg border px-2 py-1.5;
  border-color: var(--status-theme-soft);
  background-color: var(--status-theme-glass-strong);
}

.status-map-panel__legend-item {
  @apply inline-flex items-center gap-1 text-[10px] leading-none;
  color: var(--status-theme-muted);

  &::before {
    @apply block h-0 w-5 border-t-2 content-[''];
    border-color: currentColor;
  }
}

.status-map-panel__legend-item--normal {
  color: rgba(211, 232, 255, 0.86);
}

.status-map-panel__legend-item--locked {
  color: rgba(248, 113, 113, 0.92);

  &::before {
    border-style: dashed;
  }
}

.status-map-panel__legend-item--door {
  color: rgba(250, 204, 21, 0.95);

  &::before {
    border-style: dashed;
  }
}

.status-map-panel__legend-item--guard {
  color: rgba(192, 132, 252, 0.95);

  &::before {
    border-style: dashed;
  }
}

.status-map-panel__legend-item--blocked {
  color: rgba(244, 114, 182, 0.95);

  &::before {
    border-style: dotted;
  }
}

.status-map-panel__legend-item--hidden {
  color: rgba(203, 213, 225, 0.72);

  &::before {
    border-style: dotted;
  }
}

.status-map-panel__empty {
  @apply flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-lg border px-4 text-center;
  border-color: var(--status-theme-soft);
  background-color: var(--status-theme-glass-strong);
}

.status-map-panel__empty-title {
  @apply m-0 text-sm font-semibold;
  color: var(--status-theme-text);
}

.status-map-panel__empty-hint {
  @apply mb-0 mt-1 text-xs leading-relaxed;
  color: var(--status-theme-muted);
}
</style>
