export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness?: number;
}

export interface Room {
  id: string;
  name: string;
  points: Point[];
  area: number;
  color?: string;
  height?: number;
}

export interface Furniture {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  width: number;
  height: number;
  color?: string;
}

export type Tool = 'select' | 'wall' | 'room' | 'furniture' | 'measure' | 'text' | 'eraser';
