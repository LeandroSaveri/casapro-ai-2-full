// src/components/canvas/Canvas2D.tsx (VERSÃO FINAL COMPLETA)
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
import { doorTool } from './tools/doorTool';
import { windowTool } from './tools/windowTool';
import { furnitureTool } from './tools/furnitureTool';
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
import { PropertiesPanel } from '../properties/PropertiesPanel';
import { ExportPanel } from '../export/ExportPanel';
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
  const [isLoading, setIsLoading] = useState(true);
  
  const { transform, toWorld, toScreen, pan, zoom } = useCanvasTransform(canvasRef);
  const { walls, rooms, doors, windows, furniture, selection } = useProjectStore();
  const { activeTool, showGrid, gridSize, snapEnabled } = useUIStore();
  
  const snapEngineRef = useRef(new SnapEngine({ enabled: snapEnabled }));
  const animationFrameRef = useRef<number>();
  const isDraggingRef = useRef(false);
  const isPinchingRef = useRef(false);
  const lastPointerPosRef = useRef<Point>({ x: 0, y: 0 });
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(1);

  // Hidratação
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const snapPoint = useCallback((point: Point) => {
    const store = useProjectStore.getState();
    const endpoints = store.getWallEndpoints();
    const lines = store.getWallLines().map(l => ({ start: l.start, end: l.end }));
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
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      render();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
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

  // Touch/Mouse handlers otimizados
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    const pos = { x: e.clientX, y: e.clientY };
    pointersRef.current.set(e.pointerId, pos);

    // Dois dedos = pinch/zoom
    if (pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      pinchStartDistanceRef.current = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
      pinchStartScaleRef.current = transform.scale;
      isPinchingRef.current = true;
      return;
    }

    if (e.button === 2) return; // Menu de contexto

    isDraggingRef.current = true;
    lastPointerPosRef.current = pos;

    const currentTool = tools[activeTool];
    if (currentTool?.onPointerDown && pointersRef.current.size === 1) {
      const event: CanvasEvent = {
        point: toWorld(pos),
        screenPoint: pos,
        pointerId: e.pointerId,
        pressure: e.pressure,
        buttons: e.buttons,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      };
      currentTool.onPointerDown(event, getCanvasContext());
    }
  }, [activeTool, toWorld, getCanvasContext, transform.scale]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    
    const pos = { x: e.clientX, y: e.clientY };
    pointersRef.current.set(e.pointerId, pos);

    // Pinch zoom com dois dedos
    if (isPinchingRef.current && pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
      const scale = (distance / pinchStartDistanceRef.current) * pinchStartScaleRef.current;
      const center = {
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2
      };
      
      // Aplicar zoom limitado
      const newScale = Math.max(0.1, Math.min(5, scale));
      // Usar o zoom do hook
      const factor = newScale / transform.scale;
      zoom(factor, center);
      return;
    }

    // Pan com um dedo (modo select) ou drag de objeto
    if (isDraggingRef.current && pointersRef.current.size === 1 && activeTool === 'select') {
      const dx = pos.x - lastPointerPosRef.current.x;
      const dy = pos.y - lastPointerPosRef.current.y;
      
      // Se estiver movendo objeto, o tool handle isso
      // Senão, faz pan
      pan(dx, dy);
      lastPointerPosRef.current = pos;
    }

    const currentTool = tools[activeTool];
    if (currentTool?.onPointerMove && pointersRef.current.size === 1) {
      const event: CanvasEvent = {
        point: toWorld(pos),
        screenPoint: pos,
        pointerId: e.pointerId,
        pressure: e.pressure,
        buttons: e.buttons,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
      };
      currentTool.onPointerMove(event, getCanvasContext());
    }
  }, [activeTool, toWorld, getCanvasContext, pan, zoom, transform.scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    pointersRef.current.delete(e.pointerId);
    
    if (pointersRef.current.size < 2) {
      isPinchingRef.current = false;
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

  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div>Carregando CasaPro...</div>
      </div>
    );
  }

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
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
      <Toolbar />
      <ZoomControls />
      <StatusBar />
      <FurniturePanel />
      <PropertiesPanel />
      <ExportPanel />
    </div>
  );
}
