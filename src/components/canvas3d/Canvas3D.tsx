import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import type { Wall, Room, Furniture } from '@/types/canvas';
import type { Vector3 } from '@/core/3d/geometry3D';
import { to3D, wallToBox3D, roomToFloor3D, distance3D } from '@/core/3d/geometry3D';
import { createPerspectiveMatrix, createLookAtMatrix, multiplyMatrix4, project3DTo2D } from '@/core/3d/projections';
import { screenToRay, rayIntersectWall, rayIntersectFurniture } from '@/core/3d/raycast';

interface Canvas3DProps {
  className?: string;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados da câmera 3D
  const [cameraPos, setCameraPos] = useState<Vector3>({ x: 500, y: 500, z: 500 });
  const [cameraTarget, setCameraTarget] = useState<Vector3>({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<{ type: string; id: string } | null>(null);

  // Dados do projeto
  const { walls, rooms, furniture, selection, setSelection } = useProjectStore();
  const { sidebarOpen } = useUIStore();

  // Parâmetros de projeção
  const fov = Math.PI / 4;
  const near = 1;
  const far = 2000;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const aspect = width / height;

    // Limpar canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Matrizes de projeção
    const projMatrix = createPerspectiveMatrix(fov, aspect, near, far);
    const viewMatrix = createLookAtMatrix(cameraPos, cameraTarget, { x: 0, y: 1, z: 0 });
    const vpMatrix = multiplyMatrix4(viewMatrix, projMatrix);

    // Desenhar grid do chão
    drawGrid(ctx, width, height, vpMatrix);

    // Desenhar cômodos (pisos)
    rooms.forEach(room => {
      drawRoom(ctx, room, vpMatrix, width, height);
    });

    // Desenhar paredes
    walls.forEach(wall => {
      const isSelected = selection?.type === 'wall' && selection.id === wall.id;
      const isHovered = hoveredItem?.type === 'wall' && hoveredItem.id === wall.id;
      drawWall(ctx, wall, vpMatrix, width, height, isSelected, isHovered);
    });

    // Desenhar móveis
    furniture.forEach(item => {
      const isSelected = selection?.type === 'furniture' && selection.id === item.id;
      const isHovered = hoveredItem?.type === 'furniture' && hoveredItem.id === item.id;
      drawFurniture(ctx, item, vpMatrix, width, height, isSelected, isHovered);
    });

    // Desenhar UI de debug
    drawDebugInfo(ctx, width, height);
  }, [cameraPos, cameraTarget, walls, rooms, furniture, selection, hoveredItem]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    vpMatrix: { m: number[] }
  ) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 100;
    const gridCount = 20;

    for (let i = -gridCount; i <= gridCount; i++) {
      // Linhas X
      const start1 = project3DTo2D({ x: i * gridSize, y: 0, z: -gridCount * gridSize }, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height);
      const end1 = project3DTo2D({ x: i * gridSize, y: 0, z: gridCount * gridSize }, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height);

      if (start1.visible && end1.visible) {
        ctx.beginPath();
        ctx.moveTo(start1.x, start1.y);
        ctx.lineTo(end1.x, end1.y);
        ctx.stroke();
      }

      // Linhas Z
      const start2 = project3DTo2D({ x: -gridCount * gridSize, y: 0, z: i * gridSize }, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height);
      const end2 = project3DTo2D({ x: gridCount * gridSize, y: 0, z: i * gridSize }, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height);

      if (start2.visible && end2.visible) {
        ctx.beginPath();
        ctx.moveTo(start2.x, start2.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke();
      }
    }
  };

  const drawRoom = (
    ctx: CanvasRenderingContext2D,
    room: Room,
    vpMatrix: { m: number[] },
    width: number,
    height: number
  ) => {
    if (room.points.length < 3) return;

    const points3D = room.points.map(p => to3D(p, 0));
    const projected = points3D.map(p => project3DTo2D(p, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height));

    // Verificar se todos os pontos são visíveis
    if (projected.some(p => !p.visible)) return;

    ctx.fillStyle = room.color || 'rgba(59, 130, 246, 0.3)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i++) {
      ctx.lineTo(projected[i].x, projected[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Desenhar nome do cômodo
    const center = project3DTo2D(
      to3D({
        x: room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length,
        y: room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length
      }, 10),
      { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
      vpMatrix,
      width,
      height
    );

    if (center.visible) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, center.x, center.y);
    }
  };

  const drawWall = (
    ctx: CanvasRenderingContext2D,
    wall: Wall,
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const box = wallToBox3D(wall, wall.height || 280);
    const corners = [
      { x: box.min.x, y: box.min.y, z: box.min.z },
      { x: box.max.x, y: box.min.y, z: box.min.z },
      { x: box.max.x, y: box.min.y, z: box.max.z },
      { x: box.min.x, y: box.min.y, z: box.max.z },
      { x: box.min.x, y: box.max.y, z: box.min.z },
      { x: box.max.x, y: box.max.y, z: box.min.z },
      { x: box.max.x, y: box.max.y, z: box.max.z },
      { x: box.min.x, y: box.max.y, z: box.max.z }
    ];

    const projected = corners.map(p => project3DTo2D(p, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height));
    if (projected.some(p => !p.visible)) return;

    // Cores
    if (isSelected) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.strokeStyle = '#3b82f6';
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(107, 114, 128, 0.5)';
      ctx.strokeStyle = '#9ca3af';
    } else {
      ctx.fillStyle = 'rgba(75, 85, 99, 0.8)';
      ctx.strokeStyle = '#6b7280';
    }
    ctx.lineWidth = isSelected ? 3 : 1;

    // Faces visíveis (simplificação: desenhar todas)
    const faces = [
      [0, 1, 2, 3], // bottom
      [4, 5, 6, 7], // top
      [0, 1, 5, 4], // front
      [2, 3, 7, 6], // back
      [0, 3, 7, 4], // left
      [1, 2, 6, 5]  // right
    ];

    faces.forEach(face => {
      ctx.beginPath();
      ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
      for (let i = 1; i < face.length; i++) {
        ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  };

  const drawFurniture = (
    ctx: CanvasRenderingContext2D,
    item: Furniture,
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const halfW = item.width / 2;
    const halfH = item.height / 2;
    const halfD = (item.depth || 30) / 2;

    const cos = Math.cos(item.rotation);
    const sin = Math.sin(item.rotation);

    const localCorners = [
      { x: -halfW, y: 0, z: -halfD },
      { x: halfW, y: 0, z: -halfD },
      { x: halfW, y: 0, z: halfD },
      { x: -halfW, y: 0, z: halfD },
      { x: -halfW, y: halfH * 2, z: -halfD },
      { x: halfW, y: halfH * 2, z: -halfD },
      { x: halfW, y: halfH * 2, z: halfD },
      { x: -halfW, y: halfH * 2, z: halfD }
    ];

    const worldCorners = localCorners.map(p => ({
      x: p.x * cos - p.z * sin + (item.position?.x || item.x || 0),
      y: p.y,
      z: p.x * sin + p.z * cos + (item.position?.y || item.y || 0)
    }));

    const projected = worldCorners.map(p => project3DTo2D(p, { m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, vpMatrix, width, height));
    if (projected.some(p => !p.visible)) return;

    // Cores
    if (isSelected) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.strokeStyle = '#3b82f6';
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
      ctx.strokeStyle = '#fbbf24';
    } else {
      ctx.fillStyle = item.color ? `${item.color}cc` : 'rgba(156, 163, 175, 0.8)';
      ctx.strokeStyle = item.color || '#9ca3af';
    }
    ctx.lineWidth = isSelected ? 3 : 1;

    // Faces
    const faces = [
      [0, 1, 2, 3], // bottom
      [4, 5, 6, 7], // top
      [0, 1, 5, 4], // front
      [2, 3, 7, 6], // back
      [0, 3, 7, 4], // left
      [1, 2, 6, 5]  // right
    ];

    faces.forEach(face => {
      ctx.beginPath();
      ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
      for (let i = 1; i < face.length; i++) {
        ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  };

  const drawDebugInfo = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Camera: ${cameraPos.x.toFixed(0)}, ${cameraPos.y.toFixed(0)}, ${cameraPos.z.toFixed(0)}`, 20, 30);
    ctx.fillText(`Target: ${cameraTarget.x.toFixed(0)}, ${cameraTarget.y.toFixed(0)}, ${cameraTarget.z.toFixed(0)}`, 20, 50);
    ctx.fillText(`Items: ${walls.length} walls, ${rooms.length} rooms`, 20, 70);
  };

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
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });

    // Raycast para seleção
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const aspect = width / height;

    const projMatrix = createPerspectiveMatrix(fov, aspect, near, far);
    const viewMatrix = createLookAtMatrix(cameraPos, cameraTarget, { x: 0, y: 1, z: 0 });

    const ray = screenToRay(x, y, width, height, viewMatrix, projMatrix);

    // Testar interseção com móveis primeiro (mais prioritário)
    let closestHit: { type: string; id: string; distance: number } | null = null;

    furniture.forEach(item => {
      const hit = rayIntersectFurniture(ray, item);
      if (hit.hit && (!closestHit || hit.distance < closestHit.distance)) {
        closestHit = { type: 'furniture', id: item.id, distance: hit.distance };
      }
    });

    // Testar paredes
    walls.forEach(wall => {
      const hit = rayIntersectWall(ray, wall);
      if (hit.hit && (!closestHit || hit.distance < closestHit.distance)) {
        closestHit = { type: 'wall', id: wall.id, distance: hit.distance };
      }
    });

    if (closestHit) {
      setSelection({ type: closestHit.type as any, id: closestHit.id });
    } else {
      setSelection(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Hover detection
    const width = canvas.width;
    const height = canvas.height;
    const aspect = width / height;
    const projMatrix = createPerspectiveMatrix(fov, aspect, near, far);
    const viewMatrix = createLookAtMatrix(cameraPos, cameraTarget, { x: 0, y: 1, z: 0 });
    const ray = screenToRay(x, y, width, height, viewMatrix, projMatrix);

    let closestHover: { type: string; id: string } | null = null;
    let minDistance = Infinity;

    furniture.forEach(item => {
      const hit = rayIntersectFurniture(ray, item);
      if (hit.hit && hit.distance < minDistance) {
        minDistance = hit.distance;
        closestHover = { type: 'furniture', id: item.id };
      }
    });

    walls.forEach(wall => {
      const hit = rayIntersectWall(ray, wall);
      if (hit.hit && hit.distance < minDistance) {
        minDistance = hit.distance;
        closestHover = { type: 'wall', id: wall.id };
      }
    });

    setHoveredItem(closestHover);

    // Orbit camera
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;

      // Rotação orbital
      const radius = Math.sqrt(
        cameraPos.x * cameraPos.x +
        cameraPos.z * cameraPos.z
      );
      const currentAngle = Math.atan2(cameraPos.z, cameraPos.x);
      const newAngle = currentAngle - dx * 0.01;

      setCameraPos({
        x: radius * Math.cos(newAngle),
        y: Math.max(100, Math.min(1000, cameraPos.y - dy * 2)),
        z: radius * Math.sin(newAngle)
      });

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    setCameraPos({
      x: cameraPos.x * zoomFactor,
      y: cameraPos.y * zoomFactor,
      z: cameraPos.z * zoomFactor
    });
  };

  const resetCamera = () => {
    setCameraPos({ x: 500, y: 500, z: 500 });
    setCameraTarget({ x: 0, y: 0, z: 0 });
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Controles */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button
          onClick={resetCamera}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Reset Camera
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-gray-900/80 text-white px-3 py-2 rounded-lg text-sm">
        <div>Drag to rotate • Scroll to zoom • Click to select</div>
        {hoveredItem && (
          <div className="text-blue-400 mt-1">
            Hover: {hoveredItem.type} {hoveredItem.id.slice(0, 8)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas3D;
