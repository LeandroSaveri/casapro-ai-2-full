// src/core/snap/angleSnap.ts
import type { Point } from '@/types/geometry';
import { angleBetween, normalizeAngle } from '../geometry/angles';

export function snapToAngle(from: Point, to: Point, stepDegrees: number): Point {
  const angle = angleBetween(from, to);
  const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
  
  const stepRad = (stepDegrees * Math.PI) / 180;
  const snappedAngle = Math.round(angle / stepRad) * stepRad;
  
  return {
    x: from.x + Math.cos(snappedAngle) * dist,
    y: from.y + Math.sin(snappedAngle) * dist
  };
}

export function isAlignedToAngle(from: Point, to: Point, stepDegrees: number, tolerance: number = 0.01): boolean {
  const angle = angleBetween(from, to);
  const stepRad = (stepDegrees * Math.PI) / 180;
  const normalizedAngle = normalizeAngle(angle);
  const nearestStep = Math.round(normalizedAngle / stepRad) * stepRad;
  const diff = Math.abs(normalizedAngle - nearestStep);
  return diff < tolerance || Math.abs(diff - 2 * Math.PI) < tolerance;
}
