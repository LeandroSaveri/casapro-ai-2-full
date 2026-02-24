// src/core/room/roomDetection.ts
import type { Point } from '@/types/geometry';
import type { Wall, Room } from '@/types/canvas';
import { polygonArea, isClockwise } from '../geometry/polygon';
import { findCycles } from './graphCycles';
import { v4 as uuidv4 } from 'uuid';

interface GraphNode {
  id: string;
  point: Point;
  edges: string[];
}

interface GraphEdge {
  id: string;
  start: string;
  end: string;
  wallId: string;
}

export function detectRooms(walls: Wall[]): Room[] {
  if (walls.length < 3) return [];

  const { nodes, edges } = buildGraph(walls);
  const cycles = findCycles(nodes, edges);
  const rooms: Room[] = [];

  for (const cycle of cycles) {
    const points = cycle.map(nodeId => nodes.get(nodeId)!.point);
    
    if (points.length < 3) continue;

    const area = polygonArea(points);
    if (area < 1) continue;

    const roomWalls = getWallsForCycle(cycle, edges, walls);
    
    const room: Room = {
      id: uuidv4(),
      name: generateRoomName(rooms.length),
      points: isClockwise(points) ? points.reverse() : points,
      area,
      color: generateRoomColor(rooms.length),
      floorMaterial: 'default',
      wallMaterial: 'default',
      height: 2.8,
      walls: roomWalls.map(w => w.id)
    };

    rooms.push(room);
  }

  return filterNestedRooms(rooms);
}

function buildGraph(walls: Wall[]): { nodes: Map<string, GraphNode>; edges: Map<string, GraphEdge> } {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const pointToNode = new Map<string, string>();

  function getPointKey(point: Point): string {
    return `${Math.round(point.x)},${Math.round(point.y)}`;
  }

  function getOrCreateNode(point: Point): string {
    const key = getPointKey(point);
    if (pointToNode.has(key)) {
      return pointToNode.get(key)!;
    }
    const id = uuidv4();
    nodes.set(id, { id, point, edges: [] });
    pointToNode.set(key, id);
    return id;
  }

  for (const wall of walls) {
    const startId = getOrCreateNode(wall.start);
    const endId = getOrCreateNode(wall.end);

    const edgeId = uuidv4();
    const edge: GraphEdge = {
      id: edgeId,
      start: startId,
      end: endId,
      wallId: wall.id
    };

    edges.set(edgeId, edge);
    nodes.get(startId)!.edges.push(edgeId);
    nodes.get(endId)!.edges.push(edgeId);
  }

  return { nodes, edges };
}

function getWallsForCycle(cycle: string[], edges: Map<string, GraphEdge>, walls: Wall[]): Wall[] {
  const cycleWalls: Wall[] = [];
  const wallIds = new Set<string>();

  for (let i = 0; i < cycle.length; i++) {
    const current = cycle[i];
    const next = cycle[(i + 1) % cycle.length];

    for (const edge of edges.values()) {
      if ((edge.start === current && edge.end === next) || 
          (edge.start === next && edge.end === current)) {
        if (!wallIds.has(edge.wallId)) {
          const wall = walls.find(w => w.id === edge.wallId);
          if (wall) {
            cycleWalls.push(wall);
            wallIds.add(edge.wallId);
          }
        }
        break;
      }
    }
  }

  return cycleWalls;
}

function filterNestedRooms(rooms: Room[]): Room[] {
  const filtered: Room[] = [];
  
  for (const room of rooms) {
    let isNested = false;
    for (const other of rooms) {
      if (room.id === other.id) continue;
      if (isRoomInsideOther(room, other)) {
        isNested = true;
        break;
      }
    }
    if (!isNested) {
      filtered.push(room);
    }
  }
  
  return filtered;
}

function isRoomInsideOther(inner: Room, outer: Room): boolean {
  const centroid = polygonCentroid(inner.points);
  
  let inside = false;
  for (let i = 0, j = outer.points.length - 1; i < outer.points.length; j = i++) {
    const xi = outer.points[i].x, yi = outer.points[i].y;
    const xj = outer.points[j].x, yj = outer.points[j].y;
    
    const intersect = ((yi > centroid.y) !== (yj > centroid.y)) &&
      (centroid.x < (xj - xi) * (centroid.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

function polygonCentroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  
  let cx = 0;
  let cy = 0;
  let area = 0;
  
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const cross = points[i].x * points[j].y - points[j].x * points[i].y;
    area += cross;
    cx += (points[i].x + points[j].x) * cross;
    cy += (points[i].y + points[j].y) * cross;
  }
  
  area = area / 2;
  if (area === 0) {
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    return { x: sumX / points.length, y: sumY / points.length };
  }
  
  cx = cx / (6 * area);
  cy = cy / (6 * area);
  
  return { x: cx, y: cy };
}

function generateRoomName(index: number): string {
  const names = ['Sala', 'Quarto', 'Cozinha', 'Banheiro', 'Escritório', 'Quarto 2', 'Sala de Jantar', 'Lavanderia'];
  return names[index % names.length] || `Cômodo ${index + 1}`;
}

function generateRoomColor(index: number): string {
  const colors = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FCE4EC', '#E0F2F1', '#F1F8E9', '#FFF8E1'];
  return colors[index % colors.length];
}
