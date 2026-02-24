// src/components/canvas/render/drawDoor.ts
import type { Door, Wall } from '@/types/canvas';
import type { Transform } from '@/types/geometry';

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  door: Door,
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
  
  const doorPos = {
    x: door.position.x * transform.scale + transform.x,
    y: door.position.y * transform.scale + transform.y
  };
  
  const doorWidthPx = door.width * transform.scale;
  const doorThicknessPx = Math.max(4, wall.thickness * transform.scale);

  ctx.save();

  ctx.translate(doorPos.x, doorPos.y);
  ctx.rotate(Math.atan2(wallDir.y, wallDir.x));

  ctx.fillStyle = isSelected ? '#90caf9' : '#8d6e63';
  ctx.fillRect(-doorWidthPx / 2, -doorThicknessPx / 2, doorWidthPx, doorThicknessPx);

  ctx.beginPath();
  ctx.strokeStyle = isSelected ? '#1976d2' : '#5d4037';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  
  const swingRadius = doorWidthPx * 0.8;
  ctx.arc(0, 0, swingRadius, 0, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = isSelected ? '#1976d2' : '#5d4037';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.moveTo(0, 0);
  ctx.lineTo(swingRadius, 0);
  ctx.stroke();

  ctx.restore();
}

export function drawDoors(
  ctx: CanvasRenderingContext2D,
  doors: Door[],
  walls: Wall[],
  transform: Transform,
  selectedId: string | null
): void {
  for (const door of doors) {
    const wall = walls.find(w => w.id === door.wallId);
    if (wall) {
      drawDoor(ctx, door, wall, transform, door.id === selectedId);
    }
  }
}
