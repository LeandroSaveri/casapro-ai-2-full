import type { Point } from './geometry';

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
