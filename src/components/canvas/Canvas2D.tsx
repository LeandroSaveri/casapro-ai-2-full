// src/components/canvas/Canvas2D.tsx
import { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasTransform } from '@/hooks/useCanvasTransform';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { SnapEngine } from '@/core/snap/snapEngine';
import { getWallToolState } from './tools/wallTool';
import { getRoomToolState } from './tools/roomTool';
import { selectTool } from './tools/selectTool';
import { wallTool } from './tools/wallTool';
import { roomTool } from './tools/roomTool';
import { doorTool, windowTool, furnitureTool } from './tools/transformTool';
import { drawGrid } from './render/drawGrid';
import { drawWalls, drawWallInProgress } from './render/drawWall';
import { drawRooms } from './render/drawRoom';
import { drawDoors } from './render/drawDoor';
import { drawWindows } from './render/drawWindow';
import { drawFurnitureItems } from './render/drawFurniture';
import { drawSnapIndicator } from './render/drawSnapIndicator';
import { Toolbar } from './ui/Toolbar';
import { ZoomControls } from './ui/ZoomControls';
import { StatusBar } from './ui/StatusBar';
import { FurniturePanel } from './ui/FurniturePanel';
import type { Tool, CanvasEvent, CanvasContext } from '@/types/canvas';
import type { Point } from '@/types/geometry';

const tools: Record<string, Tool> = {
  select: selectTool,
  wall: wallTool,
  room: roomTool,
  door: doorTool,
  window: windowTool,
  furniture: furnitureTool
};

export function Canvas2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState('default');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  const { transform, toWorld, toScreen, pan, zoom } = useCanvasTransform(canvasRef);
  const { walls, rooms, doors, windows, furniture, selection } = useProjectStore();
  const { activeTool, showGrid, gridSize, snapEnabled, setPan } = useUIStore();
  
  const snapEngineRef = useRef(new SnapEngine({ enabled: snapEnabled }));
  const animationFrameRef = useRef<number>();
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef<Point>({ x: 0, y: 0 });
  const pointersRef = useRef<Map<number, Point>>(new Map());

  const snapPoint = useCallback((point: Point) => {
    const endpoints = useProjectStore.getState().getWallEndpoints();
    const lines = useProjectStore.getState().getWallLines().map(l => ({ start: l.start, end: l.end }));
    snapEngineRef.current.setReferences(endpoints, lines);
    return snapEngineRef.current.snap(point);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx, canvas.width, canvas.height, transform, gridSize, showGrid);
    drawRooms(ctx, rooms, transform, selection?.type === 'room' ? selection.id : null, null);
    drawWalls(ctx, walls, transform, selection?.type === 'wall' ? selection.id : null, null);
    drawDoors(ctx, doors, walls, transform, selection?.type === 'door' ? selection.id : null);
    drawWindows(ctx, windows, walls, transform, selection?.type === 'window' ? selection.id : null);
    drawFurnitureItems(ctx, furniture, transform, selection?.type === 'furniture' ? selection.id : null, null);

    const currentTool = tools[activeTool];
    if (currentTool?.id === 'wall') {
      const wallState = getWallToolState();
      if (wallState.isDrawing && wallState.startPoint && wallState.currentPoint) {
        drawWallInProgress(ctx, wallState.startPoint, wallState.currentPoint, 15, transform);
        const snapResult = snapPoint(wallState.currentPoint);
        drawSnapIndicator(ctx, snapResult, transform);
      }
    }

    if (currentTool?.id === 'room') {
      const roomState = getRoomToolState();
      if (roomState.isDrawing && roomState.points.length > 0) {
        ctx.save();
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const first = roomState.points[0];
        ctx.moveTo(first.x * transform.scale + transform.x, first.y * transform.scale + transform.y);
        for (let i = 1; i < roomState.points.length; i++) {
          const p = roomState.points[i];
          ctx.lineTo(p.x * transform.scale + transform.x, p.y * transform.scale + transform.y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [transform, walls, rooms, doors, windows, furniture, selection, activeTool, showGrid, gridSize, snapPoint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      render();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    snapEngineRef.current.setConfig({ enabled: snapEnabled });
  }, [snapEnabled]);

  const getCanvasContext = useCallback((): CanvasContext => ({
    viewport: { transform, width: canvasRef.current?.width || 0, height: canvasRef.current?.height || 0 },
    snapPoint,
    toWorld,
    toScreen,
    invalidate: () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(render);
    },
    setCursor
  }), [transform, snapPoint, toWorld, toScreen, render]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (e.button === 2) {
      setContextMenu({ x: e.clientX, y: e.clientY });
      return;
    }

    if (pointersRef.current.size === 2) {
      isDraggingRef.current = false;
      return;
    }

    isDraggingRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    const currentTool = tools[activeTool];
    if (currentTool?.onPointerDown) {
      const event: CanvasEvent = {
        point: toWorld({ x: e.clientX, y: e.clientY }),
        screenPoint: { x: e.clientX, y: e.clientY },
        pointerId: e.pointerId,
        pressure: e.pressure,
        buttons: e.buttons,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      };
      currentTool.onPointerDown(event, getCanvasContext());
    }
  }, [activeTool, toWorld, getCanvasContext]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      const pointers = Array.from(pointersRef.current.values());
      const currentDistance = Math.hypot(
        pointers[0].x - pointers[1].x,
        pointers[0].y - pointers[1].y
      );
      
      if ((e as unknown as { lastPinchDistance?: number }).lastPinchDistance) {
        const lastDistance = (e as unknown as { lastPinchDistance: number }).lastPinchDistance;
        const scale = currentDistance / lastDistance;
        const center = {
          x: (pointers[0].x + pointers[1].x) / 2,
          y: (pointers[0].y + pointers[1].y) / 2
        };
        zoom(scale, center);
      }
      (e as unknown as { lastPinchDistance: number }).lastPinchDistance = currentDistance;
      return;
    }

    if (isDraggingRef.current && activeTool === 'select') {
      const dx = e.clientX - lastPointerPosRef.current.x;
      const dy = e.clientY - lastPointerPosRef.current.y;
      pan(dx, dy);
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const currentTool = tools[activeTool];
    if (currentTool?.onPointerMove) {
      const event: CanvasEvent = {
        point: toWorld({ x: e.clientX, y: e.clientY }),
        screenPoint: { x: e.clientX, y: e.clientY },
        pointerId: e.pointerId,
        pressure: e.pressure,
        buttons: e.buttons,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      };
      currentTool.onPointerMove(event, getCanvasContext());
    }
  }, [activeTool, toWorld, getCanvasContext, pan, zoom]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    pointersRef.current.delete(e.pointerId);
    
    if (pointersRef.current.size < 2) {
      (e as unknown as { lastPinchDistance?: number }).lastPinchDistance = undefined;
    }

    if (pointersRef.current.size === 0) {
      isDraggingRef.current = false;
    }

    const currentTool = tools[activeTool];
    if (currentTool?.onPointerUp) {
      const event: CanvasEvent = {
        point: toWorld({ x: e.clientX, y: e.clientY }),
        screenPoint: { x: e.clientX, y: e.clientY },
        pointerId: e.pointerId,
        pressure: e.pressure,
        buttons: e.buttons,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      };
      currentTool.onPointerUp(event, getCanvasContext());
    }
  }, [activeTool, toWorld, getCanvasContext]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(factor, { x: e.clientX, y: e.clientY });
  }, [zoom]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const currentTool = tools[activeTool];
    if (currentTool?.onDoubleClick) {
      const event: CanvasEvent = {
        point: toWorld({ x: e.clientX, y: e.clientY }),
        screenPoint: { x: e.clientX, y: e.clientY },
        pointerId: 0,
        pressure: 1,
        buttons: 1,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      };
      currentTool.onDoubleClick(event, getCanvasContext());
    }
  }, [activeTool, toWorld, getCanvasContext]);

  useEffect(() => {
    const currentTool = tools[activeTool];
    currentTool?.onActivate?.();
    setCursor(currentTool?.cursor || 'default');
    
    return () => {
      currentTool?.onDeactivate?.();
    };
  }, [activeTool]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh',
        overflow: 'hidden',
        background: '#fafafa'
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          touchAction: 'none',
          cursor,
          display: 'block'
        }}
      />
      <Toolbar />
      <ZoomControls />
      <StatusBar />
      <FurniturePanel />
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 200
          }}
          onClick={() => setContextMenu(null)}
        >
          <button
            onClick={() => {
              if (selection) {
                const { removeWall, removeRoom, removeDoor, removeWindow, removeFurniture, clearSelection } = useProjectStore.getState();
                switch (selection.type) {
                  case 'wall': removeWall(selection.id); break;
                  case 'room': removeRoom(selection.id); break;
                  case 'door': removeDoor(selection.id); break;
                  case 'window': removeWindow(selection.id); break;
                  case 'furniture': removeFurniture(selection.id); break;
                }
                clearSelection();
              }
              setContextMenu(null);
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#d32f2f'
            }}
          >
            🗑️ Excluir
          </button>
        </div>
      )}
    </div>
  );
}
