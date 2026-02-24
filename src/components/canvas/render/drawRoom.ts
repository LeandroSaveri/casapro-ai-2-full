// src/components/canvas/render/drawRoom.ts
import type { Room } from '@/types/canvas';
import type { Transform } from '@/types/geometry';
import { polygonCentroid } from '@/core/geometry/polygon';

export function drawRoom(
  ctx: CanvasRenderingContext2D,
  room: Room,
  transform: Transform,
  isSelected: boolean,
  isHovered: boolean
): void {
  if (room.points.length < 3) return;

  ctx.save();

  ctx.beginPath();
  const firstX = room.points[0].x * transform.scale + transform.x;
  const firstY = room.points[0].y * transform.scale + transform.y;
  ctx.moveTo(firstX, firstY);

  for (let i = 1; i < room.points.length; i++) {
    const x = room.points[i].x * transform.scale + transform.x;
    const y = room.points[i].y * transform.scale + transform.y;
    ctx.lineTo(x, y);
  }

  ctx.closePath();

  ctx.fillStyle = isSelected ? room.color : room.color + '80';
  if (isHovered) {
    ctx.fillStyle = room.color + 'CC';
  }
  ctx.fill();

  ctx.strokeStyle = isSelected ? '#1976d2' : '#424242';
  ctx.lineWidth = isSelected ? 2 : 1;
  ctx.stroke();

  const centroid = polygonCentroid(room.points);
  const screenCentroid = {
    x: centroid.x * transform.scale + transform.x,
    y: centroid.y * transform.scale + transform.y
  };

  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(room.name, screenCentroid.x, screenCentroid.y - 8);

  ctx.font = '12px sans-serif';
  ctx.fillText(`${room.area.toFixed(1)}m²`, screenCentroid.x, screenCentroid.y + 8);

  ctx.restore();
}

export function drawRooms(
  ctx: CanvasRenderingContext2D,
  rooms: Room[],
  transform: Transform,
  selectedId: string | null,
  hoveredId: string | null
): void {
  for (const room of rooms) {
    drawRoom(ctx, room, transform, room.id === selectedId, room.id === hoveredId);
  }
}
