// src/core/geometry/projections.ts
import type { Point, Line, Vector2 } from '@/types/geometry';

export function projectPointOnLine(point: Point, line: Line): Point {
  const { start, end } = line;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (dx === 0 && dy === 0) {
    return { ...start };
  }
  
  const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  
  return {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
}

export function projectPointOnSegment(point: Point, line: Line): Point {
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

export function perpendicularProjection(point: Point, line: Line): Point {
  const projected = projectPointOnLine(point, line);
  return projected;
}

export function parallelProjection(point: Point, referenceLine: Line, fromPoint: Point): Point {
  const dx = referenceLine.end.x - referenceLine.start.x;
  const dy = referenceLine.end.y - referenceLine.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) {
    return { ...point };
  }
  
  const direction: Vector2 = { x: dx / length, y: dy / length };
  const fromToPoint = { x: point.x - fromPoint.x, y: point.y - fromPoint.y };
  const projection = fromToPoint.x * direction.x + fromToPoint.y * direction.y;
  
  return {
    x: fromPoint.x + projection * direction.x,
    y: fromPoint.y + projection * direction.y
  };
}

export function snapToAngle(fromPoint: Point, toPoint: Point, angleStep: number): Point {
  const dx = toPoint.x - fromPoint.x;
  const dy = toPoint.y - fromPoint.y;
  const currentAngle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  const stepRad = (angleStep * Math.PI) / 180;
  const snappedAngle = Math.round(currentAngle / stepRad) * stepRad;
  
  return {
    x: fromPoint.x + Math.cos(snappedAngle) * dist,
    y: fromPoint.y + Math.sin(snappedAngle) * dist
  };
}
