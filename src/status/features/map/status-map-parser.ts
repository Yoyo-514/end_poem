import type { StatusMapData, StatusMapEdge, StatusMapEdgeType, StatusMapNode } from '../../types/map';

/**
 * 状态面板地图解析器。
 * 解析格式兼容旧 MapGraph，但类型与实现独立于旧 map_graph 模块，方便后续删除旧目录。
 */
export class StatusMapParser {
  private static readonly MAP_REGEX = /<MapGraph>(.*?)<\/MapGraph>/s;
  private static readonly LOOSE_MAP_REGEX = /<\s*MapGraph\s*>([\s\S]*?)<\s*\/\s*MapGraph\s*>/i;

  public static extractMapText(text: string): string | null {
    const match = this.MAP_REGEX.exec(text) ?? this.LOOSE_MAP_REGEX.exec(text);
    return match?.[1] ?? null;
  }

  public static parseMapText(text: string): StatusMapData {
    const mapData: StatusMapData = {
      nodes: [],
      edges: [],
      metadata: {},
      currentLocation: null,
    };
    const nodeIds = new Set<string>();

    text.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      const nodeMatch = /^n:([^|]+)\|([^|]+)\|([^|@]+)(?:@([^|]*))?(?:\|)(-?\d+)\|(-?\d+)\|([rc])\|(.*)$/i.exec(
        trimmedLine,
      );
      if (nodeMatch) {
        const node = this.parseNode(nodeMatch);
        if (node && !nodeIds.has(node.id)) {
          nodeIds.add(node.id);
          mapData.nodes.push(node);

          if (node.characters.includes('current')) {
            mapData.currentLocation = node.id;
          }
        }
        return;
      }

      const edgeMatch = /^e:([^|]+)\|([^|]+)(?:\|([^|]+))?$/i.exec(trimmedLine);
      if (edgeMatch) {
        const edge = this.parseEdge(edgeMatch);
        if (edge) {
          mapData.edges.push(edge);
        }
        return;
      }

      const metadataMatch = /^m:([^=]+)=(.*)$/i.exec(trimmedLine);
      if (metadataMatch) {
        this.parseMetadata(metadataMatch, mapData);
      }
    });

    const validNodeIds = new Set(mapData.nodes.map(node => node.id));
    mapData.edges = mapData.edges.filter(edge => validNodeIds.has(edge.from) && validNodeIds.has(edge.to));

    return mapData;
  }

  private static parseNode(match: RegExpMatchArray): StatusMapNode | null {
    const [, id, type, labelRaw, charactersStr, xStr, yStr, shapeCode, dimensions] = match;
    const x = Number.parseInt(xStr, 10);
    const y = Number.parseInt(yStr, 10);

    if (Number.isNaN(x) || Number.isNaN(y)) {
      return null;
    }

    const node: StatusMapNode = {
      id: id.trim(),
      type: type.trim(),
      label: labelRaw.trim(),
      x,
      y,
      shape: shapeCode.toLowerCase().trim() as StatusMapNode['shape'],
      characters: charactersStr
        ? charactersStr
            .split(',')
            .map(character => character.trim())
            .filter(Boolean)
        : [],
    };

    if (node.shape === 'r') {
      const sizeMatch = /^(\d+)x(\d+)$/i.exec(dimensions.trim());
      node.width = sizeMatch ? Number.parseInt(sizeMatch[1], 10) : 72;
      node.height = sizeMatch ? Number.parseInt(sizeMatch[2], 10) : 36;
    } else {
      const radius = Number.parseInt(dimensions.trim(), 10);
      node.radius = Number.isNaN(radius) ? 18 : radius;
    }

    return node;
  }

  private static parseEdge(match: RegExpMatchArray): StatusMapEdge | null {
    const [, from, to, typeCode] = match;
    return {
      from: from.trim(),
      to: to.trim(),
      type: (typeCode?.trim() || 'c') as StatusMapEdgeType,
    };
  }

  private static parseMetadata(match: RegExpMatchArray, mapData: StatusMapData): void {
    const [, key, value] = match;
    const trimmedKey = key.trim().toLowerCase();
    const trimmedValue = value.trim();

    if (trimmedKey === 'desc') {
      mapData.metadata.description = trimmedValue;
      return;
    }

    mapData.metadata[trimmedKey] = trimmedValue;
  }
}
