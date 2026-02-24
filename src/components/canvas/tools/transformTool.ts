// src/components/canvas/tools/transformTool.ts
import type { Tool, CanvasEvent, CanvasContext } from '@/types/canvas';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { distance, pointToLineDistance } from '@/core/geometry/distance';

export const doorTool: Tool = {
  id: 'door',
  name: 'Porta',
  icon: 'door',
  cursor: 'crosshair',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const store = useProjectStore.getState();

    for (const wall of store.walls) {
      const dist = pointToLineDistance(worldPoint, { start: wall.start, end: wall.end });
      if (dist < 20) {
        store.addDoor({
          wallId: wall.id,
          position: worldPoint,
          width: 90,
          height: 210,
          angle: 0,
          openAngle: 90,
          material: 'default'
        });
        useUIStore.getState().setActiveTool('select');
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

export const windowTool: Tool = {
  id: 'window',
  name: 'Janela',
  icon: 'window',
  cursor: 'crosshair',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const store = useProjectStore.getState();

    for (const wall of store.walls) {
      const dist = pointToLineDistance(worldPoint, { start: wall.start, end: wall.end });
      if (dist < 20) {
        store.addWindow({
          wallId: wall.id,
          position: worldPoint,
          width: 120,
          height: 120,
          angle: 0,
          sillHeight: 90,
          material: 'default'
        });
        useUIStore.getState().setActiveTool('select');
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

export const furnitureTool: Tool = {
  id: 'furniture',
  name: 'Móvel',
  icon: 'furniture',
  cursor: 'crosshair',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { snapPoint, toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const snapped = snapPoint(worldPoint);
    const store = useProjectStore.getState();
    const uiStore = useUIStore.getState();
    
    const templateId = uiStore.selectedFurnitureTemplate;
    if (!templateId) {
      uiStore.setFurniturePanelOpen(true);
      return;
    }

    const template = getFurnitureTemplate(templateId);
    if (template) {
      store.addFurniture({
        type: template.id,
        category: template.category,
        position: snapped.point,
        rotation: 0,
        width: template.width,
        height: template.height,
        depth: template.depth,
        color: template.defaultColor,
        material: 'default'
      });
      uiStore.setActiveTool('select');
      ctx.invalidate();
    }
  },

  onPointerMove: (event: CanvasEvent, ctx: CanvasContext) => {
    ctx.invalidate();
  },

  onPointerUp: () => {}
};

function getFurnitureTemplate(id: string) {
  const templates = [
    { id: 'sofa-3', category: 'living' as const, width: 220, height: 90, depth: 85, defaultColor: '#8d6e63' },
    { id: 'bed-king', category: 'bedroom' as const, width: 200, height: 210, depth: 45, defaultColor: '#fff8e1' },
    { id: 'fridge', category: 'kitchen' as const, width: 80, height: 180, depth: 70, defaultColor: '#e3f2fd' },
    { id: 'toilet', category: 'bathroom' as const, width: 45, height: 70, depth: 75, defaultColor: '#ffffff' }
  ];
  return templates.find(t => t.id === id);
}
