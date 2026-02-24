// src/core/geometry/angles.ts
import type { Point, Line, Vector2 } from '@/types/geometry';

export function angleBetween(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function angleBetweenLines(line1: Line, line2: Line): number {
  const angle1 = Math.atan2(line1.end.y - line1.start.y, line1.end.x - line1.start.x);
  const angle2 = Math.atan2(line2.end.y - line2.start.y, line2.end.x - line2.start.x);
  let diff = Math.abs(angle2 - angle1);
  if (diff > Math.PI) {
    diff = 2 * Math.PI - diff;
  }
  return diff;
}

export function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
}

export function angleDifference(angle1: number, angle2: number): number {
  let diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  if (diff > Math.PI) {
    diff = 2 * Math.PI - diff;
  }
  return diff;
}

export function isParallel(line1: Line, line2: Line, tolerance: number = 0.01): boolean {
  const angleDiff = angleBetweenLines(line1, line2);
  return angleDiff < tolerance || Math.abs(angleDiff - Math.PI) < tolerance;
}

export function isPerpendicular(line1: Line, line2: Line, tolerance: number = 0.01): boolean {
  const angleDiff = angleBetweenLines(line1, line2);
  return Math.abs(angleDiff - Math.PI / 2) < tolerance;
}

export function directionVector(line: Line): Vector2 {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: dx / length, y: dy / length };
}

export function perpendicularVector(vector: Vector2): Vector2 {
  return { x: -vector.y, y: vector.x };
}

export function dotProduct(v1: Vector2, v2: Vector2): number {
  return v1.x * v2.x + v1.y * v2.y;
}

export function crossProduct(v1: Vector2, v2: Vector2): number {
  return v1.x * v2.y - v1.y * v2.x;
}
