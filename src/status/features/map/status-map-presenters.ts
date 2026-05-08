import type { GraphData } from '@antv/g6';
import type { StatusMapData, StatusMapEdge, StatusMapEdgeType, StatusMapNode } from '../../types/map';

export interface StatusMapGraphNodeData {
  label: string;
  type: string;
  shape: StatusMapNode['shape'];
  characters: string[];
  current: boolean;
  exit: boolean;
  width: number;
  height: number;
  radius: number;
}

export interface StatusMapGraphEdgeData {
  type: StatusMapEdgeType;
  label: string;
}

export type StatusMapGraphData = GraphData;

const EDGE_LABELS: Record<StatusMapEdgeType, string> = {
  c: '通路',
  l: '锁定',
  ld: '门锁',
  lg: '守卫',
  lb: '障碍',
  lh: '隐藏',
};

export const STATUS_MAP_EDGE_STYLES: Record<StatusMapEdgeType, { stroke: string; lineDash?: number[] }> = {
  c: { stroke: 'rgba(211, 232, 255, 0.72)' },
  l: { stroke: 'rgba(248, 113, 113, 0.88)', lineDash: [6, 4] },
  ld: { stroke: 'rgba(250, 204, 21, 0.9)', lineDash: [8, 4] },
  lg: { stroke: 'rgba(192, 132, 252, 0.9)', lineDash: [5, 5] },
  lb: { stroke: 'rgba(244, 114, 182, 0.9)', lineDash: [3, 4] },
  lh: { stroke: 'rgba(203, 213, 225, 0.62)', lineDash: [2, 6] },
};

export const buildStatusMapGraphData = (mapData: StatusMapData): StatusMapGraphData => ({
  nodes: mapData.nodes.map(node => toGraphNode(node, mapData.currentLocation)),
  edges: mapData.edges.map(toGraphEdge),
});

const toGraphNode = (node: StatusMapNode, currentLocation: string | null) => ({
  id: node.id,
  data: {
    label: node.label,
    type: node.type,
    shape: node.shape,
    characters: node.characters,
    current: node.id === currentLocation,
    exit: node.type === 'e',
    width: node.width ?? 72,
    height: node.height ?? 36,
    radius: node.radius ?? 18,
  },
  style: {
    x: node.x,
    y: node.y,
  },
});

const toGraphEdge = (edge: StatusMapEdge) => ({
  id: `${edge.from}-${edge.to}-${edge.type}`,
  source: edge.from,
  target: edge.to,
  data: {
    type: edge.type,
    label: EDGE_LABELS[edge.type] ?? edge.type,
  },
});
