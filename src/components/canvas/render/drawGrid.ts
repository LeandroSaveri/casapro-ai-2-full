// src/components/canvas/render/drawGrid.ts
import type { Transform } from '@/types/geometry';

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  transform: Transform,
  gridSize: number,
  showGrid: boolean
): void {
  if (!showGrid) return;

  ctx.save();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;

  const minX = (-transform.x) / transform.scale;
  const minY = (-transform.y) / transform.scale;
  const maxX = (width - transform.x) / transform.scale;
  const maxY = (height - transform.y) / transform.scale;

  const startX = Math.floor(minX / gridSize) * gridSize;
  const startY = Math.floor(minY / gridSize) * gridSize;
  const endX = Math.ceil(maxX / gridSize) * gridSize;
  const endY = Math.ceil(maxY / gridSize) * gridSize;

  ctx.beginPath();

  for (let x = startX; x <= endX; x += gridSize) {
    const screenX = x * transform.scale + transform.x;
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, height);
  }

  for (let y = startY; y <= endY; y += gridSize) {
    const screenY = y * transform.scale + transform.y;
    ctx.moveTo(0, screenY);
    ctx.lineTo(width, screenY);
  }

  ctx.stroke();

  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  const majorGridSize = gridSize * 10;
  const majorStartX = Math.floor(minX / majorGridSize) * majorGridSize;
  const majorStartY = Math.floor(minY / majorGridSize) * majorGridSize;
  const majorEndX = Math.ceil(maxX / majorGridSize) * majorGridSize;
  const majorEndY = Math.ceil(maxY / majorGridSize) * majorGridSize;

  for (let x = majorStartX; x <= majorEndX; x += majorGridSize) {
    const screenX = x * transform.scale + transform.x;
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, height);
  }

  for (let y = majorStartY; y <= majorEndY; y += majorGridSize) {
    const screenY = y * transform.scale + transform.y;
    ctx.moveTo(0, screenY);
    ctx.lineTo(width, screenY);
  }

  ctx.stroke();

  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const originX = transform.x;
  const originY = transform.y;
  ctx.moveTo(originX - 10, originY);
  ctx.lineTo(originX + 10, originY);
  ctx.moveTo(originX, originY - 10);
  ctx.lineTo(originX, originY + 10);
  ctx.stroke();

  ctx.restore();
}
