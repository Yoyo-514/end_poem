export interface StatusMapData {
  nodes: StatusMapNode[];
  edges: StatusMapEdge[];
  metadata: Record<string, string>;
  currentLocation: string | null;
}

export interface StatusMapNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  shape: StatusMapNodeShape;
  characters: string[];
  width?: number;
  height?: number;
  radius?: number;
}

export interface StatusMapEdge {
  from: string;
  to: string;
  type: StatusMapEdgeType;
}

export type StatusMapNodeShape = 'r' | 'c';
export type StatusMapEdgeType = 'c' | 'l' | 'ld' | 'lg' | 'lb' | 'lh';
