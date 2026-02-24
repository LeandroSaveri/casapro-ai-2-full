// src/types/geometry.ts
export interface Point {
  x: number;
  y: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface Segment extends Line {
  id: string;
}

export interface Polygon {
  points: Point[];
  closed: boolean;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface Circle {
  center: Point;
  radius: number;
}

export type Angle = number;

export const ZERO_POINT: Point = { x: 0, y: 0 };
export const ZERO_VECTOR: Vector2 = { x: 0, y: 0 };
