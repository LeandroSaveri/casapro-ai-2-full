// src/core/snap/snapEngine.ts
import type { Point, Line } from '@/types/geometry';
import type { SnapConfig, SnapCandidate, SnapResult } from '@/types/canvas';
import { distance } from '../geometry/distance';
import { perpendicularProjection } from '../geometry/projections';
import { directionVector } from '../geometry/angles';
import { DEFAULT_SNAP_CONFIG } from '@/types/snap';

export class SnapEngine {
  private config: SnapConfig;
  private referencePoints: Point[] = [];
  private referenceLines: Line[] = [];
  private lastPoint: Point | null = null;

  constructor(config: Partial<SnapConfig> = {}) {
    this.config = { ...DEFAULT_SNAP_CONFIG, ...config };
  }

  setReferences(points: Point[], lines: Line[]): void {
    this.referencePoints = points;
    this.referenceLines = lines;
  }

  setLastPoint(point: Point | null): void {
    this.lastPoint = point;
  }

  snap(point: Point): SnapResult {
    if (!this.config.enabled) {
      return { point, type: 'none', distance: 0 };
    }

    const candidates: SnapCandidate[] = [];

    if (this.config.snapToGrid) {
      const gridPoint = this.snapToGrid(point);
      const dist = distance(point, gridPoint);
      if (dist <= this.config.snapDistance) {
        candidates.push({ point: gridPoint, type: 'grid', priority: 1, distance: dist });
      }
    }

    if (this.config.snapToEndpoints) {
      const endpointSnap = this.findNearestEndpoint(point);
      if (endpointSnap) {
        candidates.push({ ...endpointSnap, type: 'endpoint', priority: 2 });
      }
    }

    if (this.config.snapToMidpoints) {
      const midpointSnap = this.findNearestMidpoint(point);
      if (midpointSnap) {
        candidates.push({ ...midpointSnap, type: 'midpoint', priority: 3 });
      }
    }

    if (this.config.snapToIntersections) {
      const intersectionSnap = this.findNearestIntersection(point);
      if (intersectionSnap) {
        candidates.push({ ...intersectionSnap, type: 'intersection', priority: 4 });
      }
    }

    if (this.config.snapToPerpendicular) {
      const perpSnap = this.findPerpendicularSnap(point);
      if (perpSnap) {
        candidates.push({ ...perpSnap, type: 'perpendicular', priority: 5 });
      }
    }

    if (this.config.snapToParallel && this.lastPoint) {
      const parallelSnap = this.findParallelSnap(point);
      if (parallelSnap) {
        candidates.push({ ...parallelSnap, type: 'parallel', priority: 6 });
      }
    }

    if (candidates.length === 0) {
      return { point, type: 'none', distance: 0 };
    }

    candidates.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.distance - b.distance;
    });

    const best = candidates[0];
    return {
      point: best.point,
      type: best.type as SnapResult['type'],
      distance: best.distance
    };
  }

  private snapToGrid(point: Point): Point {
    return {
      x: Math.round(point.x / this.config.gridSize) * this.config.gridSize,
      y: Math.round(point.y / this.config.gridSize) * this.config.gridSize
    };
  }

  private findNearestEndpoint(point: Point): SnapCandidate | null {
    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const refPoint of this.referencePoints) {
      const dist = distance(point, refPoint);
      if (dist < minDist && dist <= this.config.snapDistance) {
        minDist = dist;
        nearest = refPoint;
      }
    }

    return nearest ? { point: nearest, type: 'endpoint', priority: 2, distance: minDist } : null;
  }

  private findNearestMidpoint(point: Point): SnapCandidate | null {
    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const line of this.referenceLines) {
      const midpoint = {
        x: (line.start.x + line.end.x) / 2,
        y: (line.start.y + line.end.y) / 2
      };
      const dist = distance(point, midpoint);
      if (dist < minDist && dist <= this.config.snapDistance) {
        minDist = dist;
        nearest = midpoint;
      }
    }

    return nearest ? { point: nearest, type: 'midpoint', priority: 3, distance: minDist } : null;
  }

  private findNearestIntersection(point: Point): SnapCandidate | null {
    const intersections: Point[] = [];

    for (let i = 0; i < this.referenceLines.length; i++) {
      for (let j = i + 1; j < this.referenceLines.length; j++) {
        const intersection = this.lineIntersection(this.referenceLines[i], this.referenceLines[j]);
        if (intersection) {
          intersections.push(intersection);
        }
      }
    }

    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const intersection of intersections) {
      const dist = distance(point, intersection);
      if (dist < minDist && dist <= this.config.snapDistance) {
        minDist = dist;
        nearest = intersection;
      }
    }

    return nearest ? { point: nearest, type: 'intersection', priority: 4, distance: minDist } : null;
  }

  private findPerpendicularSnap(point: Point): SnapCandidate | null {
    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const line of this.referenceLines) {
      const projected = perpendicularProjection(point, line);
      const dist = distance(point, projected);
      if (dist < minDist && dist <= this.config.snapDistance) {
        const t = this.getParameterOnLine(projected, line);
        if (t >= 0 && t <= 1) {
          minDist = dist;
          nearest = projected;
        }
      }
    }

    return nearest ? { point: nearest, type: 'perpendicular', priority: 5, distance: minDist } : null;
  }

  private findParallelSnap(point: Point): SnapCandidate | null {
    if (!this.lastPoint) return null;

    let nearest: Point | null = null;
    let minDist = Infinity;

    for (const line of this.referenceLines) {
      const dir = directionVector(line);
      const currentDir = { x: point.x - this.lastPoint.x, y: point.y - this.lastPoint.y };
      const currentLength = Math.sqrt(currentDir.x * currentDir.x + currentDir.y * currentDir.y);
      
      if (currentLength === 0) continue;
      
      const normalizedCurrent = { x: currentDir.x / currentLength, y: currentDir.y / currentLength };
      const dot = Math.abs(dir.x * normalizedCurrent.x + dir.y * normalizedCurrent.y);
      
      if (dot > 0.95) {
        const pointProj = point.x * dir.x + point.y * dir.y;
        const pointPerp = -point.x * dir.y + point.y * dir.x;
        
        const parallelPoint = {
          x: pointProj * dir.x - pointPerp * dir.y,
          y: pointProj * dir.y + pointPerp * dir.x
        };
        
        const dist = distance(point, parallelPoint);
        if (dist < minDist && dist <= this.config.snapDistance) {
          minDist = dist;
          nearest = parallelPoint;
        }
      }
    }

    return nearest ? { point: nearest, type: 'parallel', priority: 6, distance: minDist } : null;
  }

  private lineIntersection(line1: Line, line2: Line): Point | null {
    const x1 = line1.start.x;
    const y1 = line1.start.y;
    const x2 = line1.end.x;
    const y2 = line1.end.y;
    const x3 = line2.start.x;
    const y3 = line2.start.y;
    const x4 = line2.end.x;
    const y4 = line2.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.001) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }

    return null;
  }

  private getParameterOnLine(point: Point, line: Line): number {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    if (dx === 0 && dy === 0) return 0;
    return ((point.x - line.start.x) * dx + (point.y - line.start.y) * dy) / (dx * dx + dy * dy);
  }
}
