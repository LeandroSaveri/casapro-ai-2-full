// src/core/snap/wallSnap.ts
import type { Point, Line } from '@/types/geometry';
import type { Wall } from '@/types/canvas';
import { distance } from '../geometry/distance';
import { perpendicularProjection } from '../geometry/projections';

export interface WallSnapResult {
  point: Point;
  wallId: string;
  type: 'endpoint' | 'midpoint' | 'perpendicular' | 'on-wall';
  param: number;
}

export function snapToWall(point: Point, walls: Wall[], threshold: number): WallSnapResult | null {
  let bestResult: WallSnapResult | null = null;
  let minDistance = threshold;

  for (const wall of walls) {
    const line = { start: wall.start, end: wall.end };
    
    const distStart = distance(point, wall.start);
    if (distStart < minDistance) {
      minDistance = distStart;
      bestResult = {
        point: wall.start,
        wallId: wall.id,
        type: 'endpoint',
        param: 0
      };
    }

    const distEnd = distance(point, wall.end);
    if (distEnd < minDistance) {
      minDistance = distEnd;
      bestResult = {
        point: wall.end,
        wallId: wall.id,
        type: 'endpoint',
        param: 1
      };
    }

    const midpoint = {
      x: (wall.start.x + wall.end.x) / 2,
      y: (wall.start.y + wall.end.y) / 2
    };
    const distMid = distance(point, midpoint);
    if (distMid < minDistance) {
      minDistance = distMid;
      bestResult = {
        point: midpoint,
        wallId: wall.id,
        type: 'midpoint',
        param: 0.5
      };
    }

    const projected = perpendicularProjection(point, line);
    const distProj = distance(point, projected);
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const lineLengthSq = dx * dx + dy * dy;
    const t = lineLengthSq > 0 ? ((projected.x - wall.start.x) * dx + (projected.y - wall.start.y) * dy) / lineLengthSq : 0;
    
    if (distProj < minDistance && t >= 0 && t <= 1) {
      minDistance = distProj;
      bestResult = {
        point: projected,
        wallId: wall.id,
        type: 'perpendicular',
        param: t
      };
    }
  }

  return bestResult;
}

export function getWallLines(walls: Wall[]): Line[] {
  return walls.map(wall => ({
    start: wall.start,
    end: wall.end
  }));
}
