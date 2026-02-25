import type { Tool, CanvasEvent, CanvasContext } from '@/types/canvas';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { pointToLineDistance } from '@/core/geometry/distance';
import { v4 as uuidv4 } from 'uuid';

export const windowTool: Tool = {
  id: 'window',
  name: 'Janela',
  icon: 'window',
  cursor: 'crosshair',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const store = useProjectStore.getState();
    const uiStore = useUIStore.getState();

    for (const wall of store.walls) {
      const dist = pointToLineDistance(worldPoint, { start: wall.start, end: wall.end });
      if (dist < 20) {
        const dx = wall.end.x - wall.start.x;
        const dy = wall.end.y - wall.start.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        const t = ((worldPoint.x - wall.start.x) * dx + (worldPoint.y - wall.start.y) * dy) / (len * len);
        const clampedT = Math.max(0.1, Math.min(0.9, t));

        const posX = wall.start.x + clampedT * dx;
        const posY = wall.start.y + clampedT * dy;

        store.addWindow({
          id: uuidv4(),
          wallId: wall.id,
          position: { x: posX, y: posY },
          width: 120,
          height: 120,
          angle: Math.atan2(dy, dx),
          sillHeight: 90,
          material: 'default'
        });

        uiStore.setActiveTool('select');
        ctx.invalidate();
        return;
      }
    }
  },

  onPointerMove: (event: CanvasEvent, ctx: CanvasContext) => {
    ctx.invalidate();
  },

  onPointerUp: () => {}
};
