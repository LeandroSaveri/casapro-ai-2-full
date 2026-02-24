// src/components/canvas/tools/selectTool.ts
import type { Tool, CanvasEvent, CanvasContext, Selection } from '@/types/canvas';
import type { Point } from '@/types/geometry';
import { distance, pointToLineDistance } from '@/core/geometry/distance';
import { isPointInPolygon } from '@/core/geometry/polygon';
import { useProjectStore } from '@/store/projectStore';

interface SelectState {
  isDragging: boolean;
  dragStart: Point | null;
  draggedObject: Selection | null;
  dragOffset: Point;
  initialPositions: Map<string, Point>;
}

const state: SelectState = {
  isDragging: false,
  dragStart: null,
  draggedObject: null,
  dragOffset: { x: 0, y: 0 },
  initialPositions: new Map()
};

export const selectTool: Tool = {
  id: 'select',
  name: 'Selecionar',
  icon: 'cursor',
  cursor: 'default',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const store = useProjectStore.getState();
    
    state.dragStart = worldPoint;
    state.isDragging = false;
    state.draggedObject = null;
    state.initialPositions.clear();

    for (const furniture of store.furniture) {
      const halfWidth = furniture.width / 2;
      const halfHeight = furniture.height / 2;
      const cos = Math.cos(-furniture.rotation);
      const sin = Math.sin(-furniture.rotation);
      const dx = worldPoint.x - furniture.position.x;
      const dy = worldPoint.y - furniture.position.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      if (Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight) {
        store.setSelection({ type: 'furniture', id: furniture.id });
        state.draggedObject = { type: 'furniture', id: furniture.id };
        state.dragOffset = {
          x: worldPoint.x - furniture.position.x,
          y: worldPoint.y - furniture.position.y
        };
        state.isDragging = true;
        ctx.invalidate();
        return;
      }
    }

    for (const door of store.doors) {
      if (distance(worldPoint, door.position) < 15) {
        store.setSelection({ type: 'door', id: door.id });
        state.draggedObject = { type: 'door', id: door.id };
        state.dragOffset = {
          x: worldPoint.x - door.position.x,
          y: worldPoint.y - door.position.y
        };
        state.isDragging = true;
        ctx.invalidate();
        return;
      }
    }

    for (const window of store.windows) {
      if (distance(worldPoint, window.position) < 15) {
        store.setSelection({ type: 'window', id: window.id });
        state.draggedObject = { type: 'window', id: window.id };
        state.dragOffset = {
          x: worldPoint.x - window.position.x,
          y: worldPoint.y - window.position.y
        };
        state.isDragging = true;
        ctx.invalidate();
        return;
      }
    }

    for (const wall of store.walls) {
      const dist = pointToLineDistance(worldPoint, { start: wall.start, end: wall.end });
      if (dist < 10) {
        store.setSelection({ type: 'wall', id: wall.id });
        state.draggedObject = { type: 'wall', id: wall.id };
        state.initialPositions.set('start', { ...wall.start });
        state.initialPositions.set('end', { ...wall.end });
        state.dragOffset = { x: 0, y: 0 };
        state.isDragging = true;
        ctx.invalidate();
        return;
      }
    }

    for (const room of store.rooms) {
      if (isPointInPolygon(worldPoint, room.points)) {
        store.setSelection({ type: 'room', id: room.id });
        ctx.invalidate();
        return;
      }
    }

    store.clearSelection();
    ctx.invalidate();
  },

  onPointerMove: (event: CanvasEvent, ctx: CanvasContext) => {
    if (!state.isDragging || !state.draggedObject) return;

    const { toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const store = useProjectStore.getState();

    const newX = worldPoint.x - state.dragOffset.x;
    const newY = worldPoint.y - state.dragOffset.y;

    switch (state.draggedObject.type) {
      case 'furniture':
        store.updateFurniture(state.draggedObject.id, {
          position: { x: newX, y: newY }
        });
        break;
      case 'door':
        store.updateDoor(state.draggedObject.id, {
          position: { x: newX, y: newY }
        });
        break;
      case 'window':
        store.updateWindow(state.draggedObject.id, {
          position: { x: newX, y: newY }
        });
        break;
      case 'wall': {
        const wall = store.walls.find(w => w.id === state.draggedObject!.id);
        if (wall && state.dragStart) {
          const startPos = state.initialPositions.get('start');
          const endPos = state.initialPositions.get('end');
          if (startPos && endPos) {
            const dx = worldPoint.x - state.dragStart.x;
            const dy = worldPoint.y - state.dragStart.y;
            store.updateWall(state.draggedObject.id, {
              start: { x: startPos.x + dx, y: startPos.y + dy },
              end: { x: endPos.x + dx, y: endPos.y + dy }
            });
          }
        }
        break;
      }
    }

    ctx.invalidate();
  },

  onPointerUp: () => {
    state.isDragging = false;
    state.draggedObject = null;
    state.dragStart = null;
    state.initialPositions.clear();
  },

  onDoubleClick: (event: CanvasEvent, ctx: CanvasContext) => {
    const { toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const store = useProjectStore.getState();

    for (const furniture of store.furniture) {
      const halfWidth = furniture.width / 2;
      const halfHeight = furniture.height / 2;
      const cos = Math.cos(-furniture.rotation);
      const sin = Math.sin(-furniture.rotation);
      const dx = worldPoint.x - furniture.position.x;
      const dy = worldPoint.y - furniture.position.y;
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      if (Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight) {
        store.updateFurniture(furniture.id, {
          rotation: furniture.rotation + Math.PI / 2
        });
        ctx.invalidate();
        return;
      }
    }
  }
};
