// src/components/canvas/tools/wallTool.ts
import type { Tool, CanvasEvent, CanvasContext } from '@/types/canvas';
import type { Point } from '@/types/geometry';
import { useProjectStore } from '@/store/projectStore';
import { detectRooms } from '@/core/room/roomDetection';

interface WallState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
}

const state: WallState = {
  isDrawing: false,
  startPoint: null,
  currentPoint: null
};

export const wallTool: Tool = {
  id: 'wall',
  name: 'Parede',
  icon: 'wall',
  cursor: 'crosshair',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { snapPoint, toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const snapped = snapPoint(worldPoint);

    if (!state.isDrawing) {
      state.isDrawing = true;
      state.startPoint = snapped.point;
      state.currentPoint = snapped.point;
    } else {
      if (state.startPoint) {
        const store = useProjectStore.getState();
        
        const dx = snapped.point.x - state.startPoint.x;
        const dy = snapped.point.y - state.startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length > 5) {
          store.addWall({
            start: state.startPoint,
            end: snapped.point,
            thickness: 15,
            height: 280,
            material: 'default'
          });

          const rooms = detectRooms(store.walls);
          for (const room of rooms) {
            const existingRoom = store.rooms.find(r => 
              r.points.length === room.points.length &&
              r.points.every((p, i) => 
                Math.abs(p.x - room.points[i].x) < 1 && 
                Math.abs(p.y - room.points[i].y) < 1
              )
            );
            if (!existingRoom) {
              store.addRoom(room);
            }
          }
        }

        state.startPoint = snapped.point;
        state.currentPoint = snapped.point;
      }
    }

    ctx.invalidate();
  },

  onPointerMove: (event: CanvasEvent, ctx: CanvasContext) => {
    const { snapPoint, toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const snapped = snapPoint(worldPoint);

    state.currentPoint = snapped.point;

    ctx.invalidate();
  },

  onPointerUp: () => {},

  onDeactivate: () => {
    state.isDrawing = false;
    state.startPoint = null;
    state.currentPoint = null;
  }
};

export function getWallToolState(): WallState {
  return state;
}
