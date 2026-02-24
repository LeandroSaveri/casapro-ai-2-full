// src/components/canvas/render/drawWindow.ts
import type { Window, Wall } from '@/types/canvas';
import type { Transform } from '@/types/geometry';

export function drawWindow(
  ctx: CanvasRenderingContext2D,
  window: Window,
  wall: Wall,
  transform: Transform,
  isSelected: boolean
): void {
  const wallStart = { x: wall.start.x * transform.scale + transform.x, y: wall.start.y * transform.scale + transform.y };
  const wallEnd = { x: wall.end.x * transform.scale + transform.x, y: wall.end.y * transform.scale + transform.y };
  
  const wallDx = wallEnd.x - wallStart.x;
  const wallDy = wallEnd.y - wallStart.y;
  const wallLength = Math.sqrt(wallDx * wallDx + wallDy * wallDy);
  
  if (wallLength === 0) return;

  const wallDir = { x: wallDx / wallLength, y: wallDy / wallLength };
  
  const windowPos = {
    x: window.position.x * transform.scale + transform.x,
    y: window.position.y * transform.scale + transform.y
  };
  
  const windowWidthPx = window.width * transform.scale;
  const windowHeightPx = Math.max(6, wall.thickness * transform.scale + 4);

  ctx.save();

  ctx.translate(windowPos.x, windowPos.y);
  ctx.rotate(Math.atan2(wallDir.y, wallDir.x));

  ctx.fillStyle = isSelected ? '#90caf9' : '#b3e5fc';
  ctx.strokeStyle = isSelected ? '#1976d2' : '#0288d1';
  ctx.lineWidth = 2;

  ctx.fillRect(-windowWidthPx / 2, -windowHeightPx / 2, windowWidthPx, windowHeightPx);
  ctx.strokeRect(-windowWidthPx / 2, -windowHeightPx / 2, windowWidthPx, windowHeightPx);

  ctx.beginPath();
  ctx.moveTo(0, -windowHeightPx / 2);
  ctx.lineTo(0, windowHeightPx / 2);
  ctx.stroke();

  ctx.restore();
}

export function drawWindows(
  ctx: CanvasRenderingContext2D,
  windows: Window[],
  walls: Wall[],
  transform: Transform,
  selectedId: string | null
): void {
  for (const window of windows) {
    const wall = walls.find(w => w.id === window.wallId);
    if (wall) {
      drawWindow(ctx, window, wall, transform, window.id === selectedId);
    }
  }
}
