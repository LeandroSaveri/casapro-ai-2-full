// src/components/canvas/render/drawSnapIndicator.ts
import type { SnapResult } from '@/types/canvas';
import type { Transform } from '@/types/geometry';

export function drawSnapIndicator(
  ctx: CanvasRenderingContext2D,
  snapResult: SnapResult,
  transform: Transform
): void {
  if (snapResult.type === 'none') return;

  const x = snapResult.point.x * transform.scale + transform.x;
  const y = snapResult.point.y * transform.scale + transform.y;

  ctx.save();

  const colors: Record<string, string> = {
    grid: '#9e9e9e',
    endpoint: '#4caf50',
    midpoint: '#ff9800',
    intersection: '#f44336',
    perpendicular: '#2196f3',
    parallel: '#9c27b0',
    angle: '#00bcd4'
  };

  const color = colors[snapResult.type] || '#757575';

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  const size = 12;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '11px sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(snapResult.type, x + 8, y - 8);

  ctx.restore();
}
