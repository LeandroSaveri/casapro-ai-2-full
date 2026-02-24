// src/components/canvas/render/drawFurniture.ts
import type { Furniture } from '@/types/canvas';
import type { Transform } from '@/types/geometry';

const furnitureIcons: Record<string, string> = {
  sofa: '🛋️',
  bed: '🛏️',
  table: '🪑',
  chair: '🪑',
  wardrobe: '🚪',
  tv: '📺',
  fridge: '🧊',
  stove: '🔥',
  sink: '🚰',
  toilet: '🚽',
  shower: '🚿',
  bath: '🛁',
  default: '📦'
};

export function drawFurniture(
  ctx: CanvasRenderingContext2D,
  furniture: Furniture,
  transform: Transform,
  isSelected: boolean,
  isHovered: boolean
): void {
  const x = furniture.position.x * transform.scale + transform.x;
  const y = furniture.position.y * transform.scale + transform.y;
  const width = furniture.width * transform.scale;
  const height = furniture.height * transform.scale;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(furniture.rotation);

  if (isSelected || isHovered) {
    ctx.strokeStyle = isSelected ? '#1976d2' : '#64b5f6';
    ctx.lineWidth = 2;
    ctx.setLineDash(isSelected ? [] : [4, 4]);
    ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);
    ctx.setLineDash([]);
  }

  ctx.fillStyle = furniture.color;
  ctx.strokeStyle = isSelected ? '#1976d2' : '#424242';
  ctx.lineWidth = 1;

  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.strokeRect(-width / 2, -height / 2, width, height);

  ctx.fillStyle = '#333';
  ctx.font = `${Math.min(width, height) * 0.5}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = furnitureIcons[furniture.type] || furnitureIcons.default;
  ctx.fillText(icon, 0, 0);

  if (isSelected) {
    ctx.beginPath();
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2;
    ctx.moveTo(0, -height / 2 - 10);
    ctx.lineTo(0, -height / 2 - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = '#1976d2';
    ctx.arc(0, -height / 2 - 20, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawFurnitureItems(
  ctx: CanvasRenderingContext2D,
  furniture: Furniture[],
  transform: Transform,
  selectedId: string | null,
  hoveredId: string | null
): void {
  for (const item of furniture) {
    drawFurniture(ctx, item, transform, item.id === selectedId, item.id === hoveredId);
  }
}
