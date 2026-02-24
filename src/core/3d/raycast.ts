// src/core/3d/raycast.ts
import type { Vector3 } from './geometry3D';
import type { Wall, Furniture } from '@/types/canvas';
import { wallToBox3D } from './geometry3D';

export interface Ray {
  origin: Vector3;
  direction: Vector3;
}

export function screenToRay(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  viewMatrix: { m: number[] },
  projMatrix: { m: number[] }
): Ray {
  // Normalizar coordenadas de tela
  const x = (2 * screenX / width) - 1;
  const y = 1 - (2 * screenY / height);

  // Criar ponto na tela (z = -1 para near plane)
  const nearPoint = { x, y, z: -1, w: 1 };
  const farPoint = { x, y, z: 1, w: 1 };

  // Inverter matrizes para obter mundo
  const invProj = invertMatrix4(projMatrix);
  const invView = invertMatrix4(viewMatrix);

  const invPVM = multiplyMatrix4Raw(invView, invProj);

  const nearWorld = transformVector4Raw(nearPoint, invPVM);
  const farWorld = transformVector4Raw(farPoint, invPVM);

  const origin = {
    x: nearWorld.x / nearWorld.w,
    y: nearWorld.y / nearWorld.w,
    z: nearWorld.z / nearWorld.w
  };

  const far = {
    x: farWorld.x / farWorld.w,
    y: farWorld.y / farWorld.w,
    z: farWorld.z / farWorld.w
  };

  const dir = normalize3D({
    x: far.x - origin.x,
    y: far.y - origin.y,
    z: far.z - origin.z
  });

  return { origin, direction: dir };
}

export function rayIntersectWall(ray: Ray, wall: Wall): { hit: boolean; point: Vector3; distance: number } {
  const box = wallToBox3D(wall);
  
  // Simplificação: tratar parede como plano
  const wallDir = {
    x: wall.end.x - wall.start.x,
    y: 0,
    z: wall.end.y - wall.start.y
  };
  
  const wallLength = Math.sqrt(wallDir.x * wallDir.x + wallDir.z * wallDir.z);
  if (wallLength === 0) return { hit: false, point: { x: 0, y: 0, z: 0 }, distance: 0 };
  
  const wallNormal = normalize3D({
    x: -wallDir.z / wallLength,
    y: 0,
    z: wallDir.x / wallLength
  });

  const denom = dot3D(ray.direction, wallNormal);
  if (Math.abs(denom) < 0.0001) return { hit: false, point: { x: 0, y: 0, z: 0 }, distance: 0 };

  // Ponto no centro da parede
  const wallCenter = {
    x: (wall.start.x + wall.end.x) / 2,
    y: 140,
    z: (wall.start.y + wall.end.y) / 2
  };

  const t = dot3D({
    x: wallCenter.x - ray.origin.x,
    y: wallCenter.y - ray.origin.y,
    z: wallCenter.z - ray.origin.z
  }, wallNormal) / denom;

  if (t < 0) return { hit: false, point: { x: 0, y: 0, z: 0 }, distance: 0 };

  const hitPoint = {
    x: ray.origin.x + ray.direction.x * t,
    y: ray.origin.y + ray.direction.y * t,
    z: ray.origin.z + ray.direction.z * t
  };

  // Verificar se está dentro dos limites da parede
  const distToLine = pointLineDistance3D(
    { x: hitPoint.x, z: hitPoint.z },
    wall.start,
    wall.end
  );

  if (distToLine > wall.thickness / 2 + 5) return { hit: false, point: hitPoint, distance: t };
  if (hitPoint.y < 0 || hitPoint.y > 280) return { hit: false, point: hitPoint, distance: t };

  return { hit: true, point: hitPoint, distance: t };
}

export function rayIntersectFurniture(ray: Ray, furniture: Furniture): { hit: boolean; point: Vector3; distance: number } {
  // Box simples para móvel
  const halfW = furniture.width / 2;
  const halfH = furniture.height / 2;
  const halfD = furniture.depth / 2;

  // Transformar ray para espaço local do móvel
  const cos = Math.cos(-furniture.rotation);
  const sin = Math.sin(-furniture.rotation);
  
  const localOrigin = {
    x: (ray.origin.x - furniture.position.x) * cos - (ray.origin.z - furniture.position.y) * sin,
    y: ray.origin.y,
    z: (ray.origin.x - furniture.position.x) * sin + (ray.origin.z - furniture.position.y) * cos
  };

  const localDir = {
    x: ray.direction.x * cos - ray.direction.z * sin,
    y: ray.direction.y,
    z: ray.direction.x * sin + ray.direction.z * cos
  };

  // Ray-AABB intersection
  const t1 = (-halfW - localOrigin.x) / localDir.x;
  const t2 = (halfW - localOrigin.x) / localDir.x;
  const t3 = (-halfH - localOrigin.y) / localDir.y;
  const t4 = (halfH - localOrigin.y) / localDir.y;
  const t5 = (-halfD - localOrigin.z) / localDir.z;
  const t6 = (halfD - localOrigin.z) / localDir.z;

  const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6));
  const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6));

  if (tmax < 0 || tmin > tmax) return { hit: false, point: { x: 0, y: 0, z: 0 }, distance: 0 };

  const t = tmin < 0 ? tmax : tmin;
  const localHit = {
    x: localOrigin.x + localDir.x * t,
    y: localOrigin.y + localDir.y * t,
    z: localOrigin.z + localDir.z * t
  };

  // Transformar de volta
  const worldHit = {
    x: localHit.x * cos + localHit.z * sin + furniture.position.x,
    y: localHit.y,
    z: -localHit.x * sin + localHit.z * cos + furniture.position.y
  };

  return { hit: true, point: worldHit, distance: t };
}

function pointLineDistance3D(point: { x: number; z: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }): number {
  const dx = lineEnd.x - lineStart.x;
  const dz = lineEnd.y - lineStart.y;
  const len2 = dx * dx + dz * dz;
  
  if (len2 === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.z - lineStart.y) ** 2);
  
  let t = ((point.x - lineStart.x) * dx + (point.z - lineStart.y) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  
  const projX = lineStart.x + t * dx;
  const projZ = lineStart.y + t * dz;
  
  return Math.sqrt((point.x - projX) ** 2 + (point.z - projZ) ** 2);
}

function invertMatrix4(m: { m: number[] }): { m: number[] } {
  const inv = new Array(16).fill(0);
  const mat = m.m;

  inv[0] = mat[5] * mat[10] * mat[15] - mat[5] * mat[11] * mat[14] - mat[9] * mat[6] * mat[15] + mat[9] * mat[7] * mat[14] + mat[13] * mat[6] * mat[11] - mat[13] * mat[7] * mat[10];
  inv[4] = -mat[4] * mat[10] * mat[15] + mat[4] * mat[11] * mat[14] + mat[8] * mat[6] * mat[15] - mat[8] * mat[7] * mat[14] - mat[12] * mat[6] * mat[11] + mat[12] * mat[7] * mat[10];
  inv[8] = mat[4] * mat[9] * mat[15] - mat[4] * mat[11] * mat[13] - mat[8] * mat[5] * mat[15] + mat[8] * mat[7] * mat[13] + mat[12] * mat[5] * mat[11] - mat[12] * mat[7] * mat[9];
  inv[12] = -mat[4] * mat[9] * mat[14] + mat[4] * mat[10] * mat[13] + mat[8] * mat[5] * mat[14] - mat[8] * mat[6] * mat[13] - mat[12] * mat[5] * mat[10] + mat[12] * mat[6] * mat[9];

  const det = mat[0] * inv[0] + mat[1] * inv[4] + mat[2] * inv[8] + mat[3] * inv[12];
  if (det === 0) return { m: mat };

  const invDet = 1 / det;
  for (let i = 0; i < 16; i++) inv[i] *= invDet;

  return { m: inv };
}

function multiplyMatrix4Raw(a: { m: number[] }, b: { m: number[] }): { m: number[] } {
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

function transformVector4Raw(v: { x: number; y: number; z: number; w: number }, m: { m: number[] }): { x: number; y: number; z: number; w: number } {
  return {
    x: v.x * m.m[0] + v.y * m.m[4] + v.z * m.m[8] + v.w * m.m[12],
    y: v.x * m.m[1] + v.y * m.m[5] + v.z * m.m[9] + v.w * m.m[13],
    z: v.x * m.m[2] + v.y * m.m[6] + v.z * m.m[10] + v.w * m.m[14],
    w: v.x * m.m[3] + v.y * m.m[7] + v.z * m.m[11] + v.w * m.m[15]
  };
}

function normalize3D(v: Vector3): Vector3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function dot3D(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
