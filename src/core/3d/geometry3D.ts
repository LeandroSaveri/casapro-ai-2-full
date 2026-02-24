// src/core/3d/geometry3D.ts
import type { Point } from '@/types/geometry';
import type { Wall, Room } from '@/types/canvas';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Box3D {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
}

export function to3D(point: Point, y: number = 0): Vector3 {
  return { x: point.x, y, z: point.y };
}

export function to2D(vector: Vector3): Point {
  return { x: vector.x, y: vector.z };
}

export function wallToBox3D(wall: Wall, height: number = 280): Box3D {
  const minX = Math.min(wall.start.x, wall.end.x) - wall.thickness / 2;
  const maxX = Math.max(wall.start.x, wall.end.x) + wall.thickness / 2;
  const minZ = Math.min(wall.start.y, wall.end.y) - wall.thickness / 2;
  const maxZ = Math.max(wall.start.y, wall.end.y) + wall.thickness / 2;

  return {
    min: { x: minX, y: 0, z: minZ },
    max: { x: maxX, y: height, z: maxZ },
    center: { 
      x: (minX + maxX) / 2, 
      y: height / 2, 
      z: (minZ + maxZ) / 2 
    },
    size: { 
      x: maxX - minX, 
      y: height, 
      z: maxZ - minZ 
    }
  };
}

export function roomToFloor3D(room: Room): { points: Vector3[]; center: Vector3 } {
  const points = room.points.map(p => to3D(p, 0));
  const center = to3D(
    { 
      x: room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length,
      y: room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length
    }, 
    0
  );
  return { points, center };
}

export function distance3D(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function lerp3D(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  };
}

export function transformPoint3D(
  point: Vector3, 
  transform: { position: Vector3; rotation: Vector3; scale: Vector3 }
): Vector3 {
  // Aplicar escala
  let x = point.x * transform.scale.x;
  let y = point.y * transform.scale.y;
  let z = point.z * transform.scale.z;

  // Aplicar rotação Y (yaw)
  const cosY = Math.cos(transform.rotation.y);
  const sinY = Math.sin(transform.rotation.y);
  const x1 = x * cosY - z * sinY;
  const z1 = x * sinY + z * cosY;
  x = x1;
  z = z1;

  // Aplicar rotação X (pitch)
  const cosX = Math.cos(transform.rotation.x);
  const sinX = Math.sin(transform.rotation.x);
  const y1 = y * cosX - z * sinX;
  const z2 = y * sinX + z * cosX;
  y = y1;
  z = z2;

  // Aplicar translação
  return {
    x: x + transform.position.x,
    y: y + transform.position.y,
    z: z + transform.position.z
  };
}
