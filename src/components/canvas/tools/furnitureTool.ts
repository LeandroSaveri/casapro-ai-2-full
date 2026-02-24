// src/components/canvas/tools/furnitureTool.ts
import type { Tool, CanvasEvent, CanvasContext } from '@/types/canvas';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { getFurnitureTemplate } from '@/data/furnitureData';
import { v4 as uuidv4 } from 'uuid';

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
        id: uuidv4(),
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
      uiStore.setSelectedFurnitureTemplate(null);
      ctx.invalidate();
    }
  },

  onPointerMove: (event: CanvasEvent, ctx: CanvasContext) => {
    ctx.invalidate();
  },

  onPointerUp: () => {}
};
