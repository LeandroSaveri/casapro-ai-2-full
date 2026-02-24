// src/core/geometry/distance.ts
import type { Point, Line } from '@/types/geometry';

export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSquared(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

export function pointToLineDistance(point: Point, line: Line): number {
  const { start, end } = line;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (dx === 0 && dy === 0) {
    return distance(point, start);
  }
  
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  const projection = {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
  
  return distance(point, projection);
}

export function pointToSegmentProjection(point: Point, line: Line): Point {
  const { start, end } = line;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (dx === 0 && dy === 0) {
    return { ...start };
  }
  
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  
  return {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
}

export function isPointNearLine(point: Point, line: Line, threshold: number): boolean {
  return pointToLineDistance(point, line) <= threshold;
}

export function isPointNearEndpoint(point: Point, line: Line, threshold: number): boolean {
  return distance(point, line.start) <= threshold || distance(point, line.end) <= threshold;
}
