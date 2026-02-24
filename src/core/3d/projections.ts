// src/core/3d/projections.ts
import type { Vector3 } from './geometry3D';

export interface Matrix4 {
  m: number[];
}

export function createPerspectiveMatrix(
  fov: number,
  aspect: number,
  near: number,
  far: number
): Matrix4 {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);

  return {
    m: [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0
    ]
  };
}

export function createLookAtMatrix(
  eye: Vector3,
  target: Vector3,
  up: Vector3
): Matrix4 {
  const zAxis = normalize3D(subtract3D(eye, target));
  const xAxis = normalize3D(cross3D(up, zAxis));
  const yAxis = cross3D(zAxis, xAxis);

  return {
    m: [
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      -dot3D(xAxis, eye), -dot3D(yAxis, eye), -dot3D(zAxis, eye), 1
    ]
  };
}

export function multiplyMatrix4(a: Matrix4, b: Matrix4): Matrix4 {
  const result = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        result[i * 4 + j] += a.m[i * 4 + k] * b.m[k * 4 + j];
      }
    }
  }
  return { m: result };
}

export function project3DTo2D(
  point: Vector3,
  viewMatrix: Matrix4,
  projMatrix: Matrix4,
  width: number,
  height: number
): { x: number; y: number; z: number; visible: boolean } {
  // Aplicar view matrix
  const view = transformVector4(point, viewMatrix);
  // Aplicar projection matrix
  const proj = transformVector4(view, projMatrix);

  if (proj.w === 0) return { x: 0, y: 0, z: 0, visible: false };

  // Normalizar coordenadas homogêneas
  const x = proj.x / proj.w;
  const y = proj.y / proj.w;
  const z = proj.z / proj.w;

  // Converter para coordenadas de tela
  return {
    x: (x + 1) * width / 2,
    y: (1 - y) * height / 2,
    z: z,
    visible: z >= -1 && z <= 1
  };
}

function transformVector4(v: Vector3, m: Matrix4): { x: number; y: number; z: number; w: number } {
  return {
    x: v.x * m.m[0] + v.y * m.m[4] + v.z * m.m[8] + m.m[12],
    y: v.x * m.m[1] + v.y * m.m[5] + v.z * m.m[9] + m.m[13],
    z: v.x * m.m[2] + v.y * m.m[6] + v.z * m.m[10] + m.m[14],
    w: v.x * m.m[3] + v.y * m.m[7] + v.z * m.m[11] + m.m[15]
  };
}

function subtract3D(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function cross3D(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function dot3D(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function normalize3D(v: Vector3): Vector3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}
