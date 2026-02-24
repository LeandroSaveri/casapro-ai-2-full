// src/components/canvas/render/drawWall.ts
import type { Wall } from '@/types/canvas';
import type { Transform, Point } from '@/types/geometry';

export function drawWall(
  ctx: CanvasRenderingContext2D,
  wall: Wall,
  transform: Transform,
  isSelected: boolean,
  isHovered: boolean
): void {
  const startX = wall.start.x * transform.scale + transform.x;
  const startY = wall.start.y * transform.scale + transform.y;
  const endX = wall.end.x * transform.scale + transform.x;
  const endY = wall.end.y * transform.scale + transform.y;

  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return;

  const nx = -dy / length;
  const ny = dx / length;
  const halfThickness = (wall.thickness * transform.scale) / 2;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(startX + nx * halfThickness, startY + ny * halfThickness);
  ctx.lineTo(endX + nx * halfThickness, endY + ny * halfThickness);
  ctx.lineTo(endX - nx * halfThickness, endY - ny * halfThickness);
  ctx.lineTo(startX - nx * halfThickness, startY - ny * halfThickness);
  ctx.closePath();

  if (isSelected) {
    ctx.fillStyle = '#90caf9';
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2;
  } else if (isHovered) {
    ctx.fillStyle = '#e3f2fd';
    ctx.strokeStyle = '#64b5f6';
    ctx.lineWidth = 1.5;
  } else {
    ctx.fillStyle = '#424242';
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1;
  }

  ctx.fill();
  ctx.stroke();

  const endpointRadius = 4;
  ctx.fillStyle = isSelected ? '#1976d2' : '#757575';

  ctx.beginPath();
  ctx.arc(startX, startY, endpointRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(endX, endY, endpointRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawWalls(
  ctx: CanvasRenderingContext2D,
  walls: Wall[],
  transform: Transform,
  selectedId: string | null,
  hoveredId: string | null
): void {
  for (const wall of walls) {
    drawWall(ctx, wall, transform, wall.id === selectedId, wall.id === hoveredId);
  }
}

export function drawWallInProgress(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  thickness: number,
  transform: Transform
): void {
  const startX = start.x * transform.scale + transform.x;
  const startY = start.y * transform.scale + transform.y;
  const endX = end.x * transform.scale + transform.x;
  const endY = end.y * transform.scale + transform.y;

  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return;

  const nx = -dy / length;
  const ny = dx / length;
  const halfThickness = (thickness * transform.scale) / 2;

  ctx.save();
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(startX + nx * halfThickness, startY + ny * halfThickness);
  ctx.lineTo(endX + nx * halfThickness, endY + ny * halfThickness);
  ctx.lineTo(endX - nx * halfThickness, endY - ny * halfThickness);
  ctx.lineTo(startX - nx * halfThickness, startY - ny * halfThickness);
  ctx.closePath();

  ctx.fillStyle = 'rgba(144, 202, 249, 0.3)';
  ctx.strokeStyle = '#1976d2';
  ctx.lineWidth = 1;

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
