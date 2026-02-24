export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness?: number;
  height?: number;
  material?: string;
}

export interface Room {
  id: string;
  name: string;
  points: Point[];
  area: number;
  color?: string;
  height?: number;
  floorMaterial?: string;
  wallMaterial?: string;
  walls?: string[];
}

export interface Door {
  id: string;
  wallId: string;
  position: Point;
  width: number;
  height: number;
  angle: number;
  openAngle?: number;
  material?: string;
}

export interface Window {
  id: string;
  wallId: string;
  position: Point;
  width: number;
  height: number;
  angle: number;
  sillHeight?: number;
  material?: string;
}

export interface Furniture {
  id: string;
  type: string;
  category?: string;
  position: Point;
  x?: number;
  y?: number;
  rotation: number;
  scale?: number;
  width: number;
  height: number;
  depth?: number;
  color?: string;
  material?: string;
}

export interface Selection {
  type: 'wall' | 'room' | 'door' | 'window' | 'furniture';
  id: string;
}

export type ToolType = 'select' | 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'measure' | 'text' | 'eraser';

export interface Tool {
  id: string;
  name: string;
  icon: string;
  cursor: string;
  onPointerDown?: (event: CanvasEvent, ctx: CanvasContext) => void;
  onPointerMove?: (event: CanvasEvent, ctx: CanvasContext) => void;
  onPointerUp?: (event: CanvasEvent, ctx: CanvasContext) => void;
  onDeactivate?: () => void;
}

export interface CanvasEvent {
  screenPoint: Point;
  button: number;
  altKey: boolean;
  clientX: number;
  clientY: number;
}

export interface CanvasContext {
  snapPoint: (point: Point) => { point: Point; snapped: boolean };
  toWorld: (screenPoint: Point) => Point;
  invalidate: () => void;
}

export interface FurnitureTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  icon: string;
  defaultColor: string;
}

export interface SnapConfig {
  enabled: boolean;
  snapToGrid: boolean;
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
  snapToPerpendicular: boolean;
  snapToParallel: boolean;
  gridSize: number;
  snapDistance: number;
}

export interface SnapCandidate {
  point: Point;
  type: string;
  priority: number;
  distance: number;
}

export interface SnapResult {
  point: Point;
  type: 'none' | 'grid' | 'endpoint' | 'midpoint' | 'intersection' | 'perpendicular' | 'parallel' | 'angle';
  distance: number;
}

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  snapToGrid: true,
  snapToEndpoints: true,
  snapToMidpoints: true,
  snapToIntersections: true,
  snapToPerpendicular: true,
  snapToParallel: true,
  gridSize: 10,
  snapDistance: 10
};
