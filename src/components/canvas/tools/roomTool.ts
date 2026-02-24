// src/components/canvas/tools/roomTool.ts
import type { Tool, CanvasEvent, CanvasContext } from '@/types/canvas';
import type { Point } from '@/types/geometry';
import { useProjectStore } from '@/store/projectStore';
import { polygonArea } from '@/core/geometry/polygon';
import { v4 as uuidv4 } from 'uuid';

interface RoomState {
  points: Point[];
  isDrawing: boolean;
}

const state: RoomState = {
  points: [],
  isDrawing: false
};

export const roomTool: Tool = {
  id: 'room',
  name: 'Cômodo',
  icon: 'room',
  cursor: 'crosshair',

  onPointerDown: (event: CanvasEvent, ctx: CanvasContext) => {
    const { snapPoint, toWorld } = ctx;
    const worldPoint = toWorld(event.screenPoint);
    const snapped = snapPoint(worldPoint);

    if (!state.isDrawing) {
      state.isDrawing = true;
      state.points = [snapped.point];
    } else {
      if (state.points.length >= 3) {
        const firstPoint = state.points[0];
        const dx = snapped.point.x - firstPoint.x;
        const dy = snapped.point.y - firstPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
          const store = useProjectStore.getState();
          const area = polygonArea(state.points);
          
          if (area > 100) {
            store.addRoom({
              id: uuidv4(),
              name: `Cômodo ${store.rooms.length + 1}`,
              points: [...state.points],
              area,
              color: generateRoomColor(store.rooms.length),
              floorMaterial: 'default',
              wallMaterial: 'default',
              height: 2.8,
              walls: []
            });
          }

          state.isDrawing = false;
          state.points = [];
          ctx.invalidate();
          return;
        }
      }

      state.points.push(snapped.point);
    }

    ctx.invalidate();
  },

  onPointerMove: (event: CanvasEvent, ctx: CanvasContext) => {
    ctx.invalidate();
  },

  onPointerUp: () => {},

  onDeactivate: () => {
    state.isDrawing = false;
    state.points = [];
  }
};

export function getRoomToolState(): RoomState {
  return state;
}

function generateRoomColor(index: number): string {
  const colors = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FCE4EC', '#E0F2F1'];
  return colors[index % colors.length];
}
