import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import type { Point } from '@/types/geometry';
import type { Wall, Room, Furniture } from '@/types/canvas';

interface Canvas2DProps {
  className?: string;
}

export const Canvas2D: React.FC<Canvas2DProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados de transformação (locais)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // Estados do useUIStore
  const { 
    activeTool, 
    setActiveTool, 
    showGrid, 
    gridSize, 
    snapToGrid 
  } = useUIStore();

  // Estados do useProjectStore
  const { 
    walls, 
    rooms, 
    furniture, 
    selection, 
    addWall, 
    addRoom, 
    addFurniture,
    setSelection,
    clearSelection 
  } = useProjectStore();

  // Estados de interação (locais)
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [tempWall, setTempWall] = useState<Wall | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });

  // Estados derivados de seleção
  const selectedRoomId = selection?.type === 'room' ? selection.id : null;
  const selectedWallId = selection?.type === 'wall' ? selection.id : null;
  const selectedFurnitureId = selection?.type === 'furniture' ? selection.id : null;

  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left - offset.x) / scale,
      y: (screenY - rect.top - offset.y) / scale
    };
  }, [scale, offset]);

  const snapPoint = useCallback((point: Point): Point => {
    if (!snapToGrid) return point;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  const calculateArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!showGrid) return;
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const startX = Math.floor(-offset.x / scale / gridSize) * gridSize;
    const startY = Math.floor(-offset.y / scale / gridSize) * gridSize;
    const endX = startX + (width / scale) + gridSize * 2;
    const endY = startY + (height / scale) + gridSize * 2;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.lineTo(0, endY);
    ctx.moveTo(startX, 0);
    ctx.lineTo(endX, 0);
    ctx.stroke();
    ctx.restore();
  };

  const drawWalls = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    walls.forEach(wall => {
      ctx.beginPath();
      ctx.moveTo(wall.start.x, wall.start.y);
      ctx.lineTo(wall.end.x, wall.end.y);
      ctx.strokeStyle = selectedWallId === wall.id ? '#3b82f6' : '#374151';
      ctx.lineWidth = wall.thickness || 5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.fillStyle = selectedWallId === wall.id ? '#3b82f6' : '#6b7280';
      ctx.beginPath();
      ctx.arc(wall.start.x, wall.start.y, 4, 0, Math.PI * 2);
      ctx.arc(wall.end.x, wall.end.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    if (tempWall) {
      ctx.beginPath();
      ctx.moveTo(tempWall.start.x, tempWall.start.y);
      ctx.lineTo(tempWall.end.x, tempWall.end.y);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = tempWall.thickness || 5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  };

  const drawRooms = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    rooms.forEach(room => {
      if (room.points.length < 3) return;
      ctx.beginPath();
      ctx.moveTo(room.points[0].x, room.points[0].y);
      for (let i = 1; i < room.points.length; i++) {
        ctx.lineTo(room.points[i].x, room.points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = room.color || 'rgba(59, 130, 246, 0.1)';
      ctx.fill();
      ctx.strokeStyle = selectedRoomId === room.id ? '#3b82f6' : '#6b7280';
      ctx.lineWidth = selectedRoomId === room.id ? 3 : 2;
      ctx.stroke();
      const centroid = room.points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      centroid.x /= room.points.length;
      centroid.y /= room.points.length;
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${room.name} (${room.area.toFixed(1)}m²)`, centroid.x, centroid.y);
    });
    if (currentPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
      }
      if (mousePos) {
        ctx.lineTo(mousePos.x, mousePos.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#3b82f6';
      currentPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  };

  const drawFurniture = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    furniture.forEach(item => {
      const x = item.position?.x ?? item.x ?? 0;
      const y = item.position?.y ?? item.y ?? 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(item.rotation);
      ctx.scale(item.scale || 1, item.scale || 1);
      ctx.fillStyle = item.color || '#f3f4f6';
      ctx.strokeStyle = selectedFurnitureId === item.id ? '#3b82f6' : '#6b7280';
      ctx.lineWidth = selectedFurnitureId === item.id ? 3 : 2;
      ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.fillStyle = '#374151';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.type, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    drawGrid(ctx, canvas.width, canvas.height);
    drawRooms(ctx);
    drawWalls(ctx);
    drawFurniture(ctx);
    ctx.restore();
  }, [offset, scale, rooms, walls, furniture, showGrid, gridSize, selectedRoomId, selectedWallId, selectedFurnitureId, tempWall, currentPoints, mousePos]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      render();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = screenToCanvas(e.clientX, e.clientY);
    const snappedPoint = snapPoint(point);
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    switch (activeTool) {
      case 'select':
        setDragStart(snappedPoint);
        break;
      case 'wall':
        setIsDrawing(true);
        setDrawStart(snappedPoint);
        setTempWall({
          id: 'temp',
          start: snappedPoint,
          end: snappedPoint,
          thickness: 5
        });
        break;
      case 'room':
        setCurrentPoints(prev => [...prev, snappedPoint]);
        break;
      case 'furniture':
        addFurniture({
          id: Date.now().toString(),
          type: 'Sofa',
          position: { x: snappedPoint.x, y: snappedPoint.y },
          x: snappedPoint.x,
          y: snappedPoint.y,
          rotation: 0,
          scale: 1,
          width: 60,
          height: 30
        });
        break;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = screenToCanvas(e.clientX, e.clientY);
    const snappedPoint = snapPoint(point);
    setMousePos(snappedPoint);
    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }
    if (isDrawing && tempWall && drawStart) {
      setTempWall({
        ...tempWall,
        end: snappedPoint
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (isDrawing && tempWall && drawStart) {
      const point = screenToCanvas(e.clientX, e.clientY);
      const snappedPoint = snapPoint(point);
      const dx = snappedPoint.x - drawStart.x;
      const dy = snappedPoint.y - drawStart.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length > 5) {
        addWall({
          id: Date.now().toString(),
          start: drawStart,
          end: snappedPoint,
          thickness: 5
        });
      }
      setIsDrawing(false);
      setDrawStart(null);
      setTempWall(null);
    }
  };

  const handleDoubleClick = () => {
    if (activeTool === 'room' && currentPoints.length >= 3) {
      const area = calculateArea(currentPoints);
      addRoom({
        id: Date.now().toString(),
        name: `Cômodo ${rooms.length + 1}`,
        points: [...currentPoints],
        area: area,
        color: 'rgba(59, 130, 246, 0.1)',
        height: 2.8
      });
      setCurrentPoints([]);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor));
    const point = screenToCanvas(e.clientX, e.clientY);
    const newOffset = {
      x: e.clientX - point.x * newScale,
      y: e.clientY - point.y * newScale
    };
    setScale(newScale);
    setOffset(newOffset);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && activeTool === 'room' && currentPoints.length >= 3) {
        const area = calculateArea(currentPoints);
        addRoom({
          id: Date.now().toString(),
          name: `Cômodo ${rooms.length + 1}`,
          points: [...currentPoints],
          area: area,
          color: 'rgba(59, 130, 246, 0.1)',
          height: 2.8
        });
        setCurrentPoints([]);
      }
      if (e.key === 'Escape') {
        setCurrentPoints([]);
        setTempWall(null);
        setIsDrawing(false);
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, currentPoints, rooms.length, addRoom, clearSelection]);

  const zoomIn = () => setScale(Math.min(5, scale * 1.2));
  const zoomOut = () => setScale(Math.max(0.1, scale / 1.2));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const exportData = () => {
    const data = {
      rooms,
      walls,
      furniture,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casapro-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden bg-gray-50 ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPanning(false)}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
      />
      
      {/* Controles de Zoom */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors text-xs"
        >
          ⌂
        </button>
      </div>

      {/* Info de Zoom */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow-md text-sm text-gray-700">
        {Math.round(scale * 100)}%
      </div>

      {/* Grid Info */}
      <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow-md text-sm text-gray-700">
        Grid: {gridSize}cm
      </div>

      {/* Coordenadas do Mouse */}
      <div className="absolute top-4 right-4 bg-white/90 px-3 py-2 rounded-lg shadow-md text-sm text-gray-700 font-mono">
        X: {mousePos.x.toFixed(0)} Y: {mousePos.y.toFixed(0)}
      </div>

      {/* Contador de Pontos (modo room) */}
      {activeTool === 'room' && currentPoints.length > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {currentPoints.length} pontos
        </div>
      )}

      {/* Botão Export */}
      <button
        onClick={exportData}
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors text-sm font-medium"
      >
        Exportar Projeto
      </button>

      {/* Hint para finalizar cômodo */}
      {activeTool === 'room' && currentPoints.length > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Pressione Enter para finalizar ou Escape para cancelar
        </div>
      )}
    </div>
  );
};

export default Canvas2D;
