// src/components/canvas3d/Canvas3D.tsx
import { useRef, useEffect, useCallback, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { createPerspectiveMatrix, createLookAtMatrix, multiplyMatrix4, project3DTo2D } from '@/core/3d/projections';
import { screenToRay, rayIntersectWall, rayIntersectFurniture } from '@/core/3d/raycast';
import { to3D, wallToBox3D, roomToFloor3D, distance3D, lerp3D } from '@/core/3d/geometry3D';
import type { Vector3 } from '@/core/3d/geometry3D';
import type { Wall, Furniture } from '@/types/canvas';

interface CameraState {
  position: Vector3;
  target: Vector3;
  distance: number;
  azimuth: number;
  polar: number;
}

export function Canvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { walls, rooms, doors, windows, furniture, selection, setSelection, updateWall, updateFurniture } = useProjectStore();
  const { zoom: uiZoom } = useUIStore();
  
  const cameraRef = useRef<CameraState>({
    position: { x: 0, y: 400, z: 600 },
    target: { x: 0, y: 0, z: 0 },
    distance: 700,
    azimuth: -Math.PI / 4,
    polar: Math.PI / 3
  });

  const isDraggingRef = useRef(false);
  const isRotatingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef<{ type: string; id: string } | null>(null);
  const draggedObjectRef = useRef<{ type: string; id: string; startPos: Vector3; startY: number } | null>(null);
  const planeYRef = useRef(0);

  const updateCamera = useCallback(() => {
    const cam = cameraRef.current;
    cam.position.x = cam.target.x + cam.distance * Math.cos(cam.polar) * Math.cos(cam.azimuth);
    cam.position.y = cam.target.y + cam.distance * Math.sin(cam.polar);
    cam.position.z = cam.target.z + cam.distance * Math.cos(cam.polar) * Math.sin(cam.azimuth);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, width, height);

    // Gradiente de céu
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Matrizes
    const projMatrix = createPerspectiveMatrix(Math.PI / 4, width / height, 1, 5000);
    const viewMatrix = createLookAtMatrix(
      cameraRef.current.position,
      cameraRef.current.target,
      { x: 0, y: 1, z: 0 }
    );
    const vpMatrix = multiplyMatrix4(viewMatrix, projMatrix);

    // Ordenar objetos por distância (painter's algorithm)
    const renderList: Array<{
      type: 'wall' | 'floor' | 'furniture' | 'door' | 'window';
      id: string;
      distance: number;
      render: () => void;
    }> = [];

    // Pisos
    rooms.forEach(room => {
      const { center } = roomToFloor3D(room);
      const dist = distance3D(center, cameraRef.current.position);
      renderList.push({
        type: 'floor',
        id: room.id,
        distance: dist,
        render: () => drawRoomFloor(ctx, room, vpMatrix, width, height, selection?.id === room.id)
      });
    });

    // Paredes
    walls.forEach(wall => {
      const box = wallToBox3D(wall);
      const dist = distance3D(box.center, cameraRef.current.position);
      renderList.push({
        type: 'wall',
        id: wall.id,
        distance: dist,
        render: () => drawWall3D(ctx, wall, vpMatrix, width, height, 
          selection?.type === 'wall' && selection.id === wall.id,
          hoveredRef.current?.type === 'wall' && hoveredRef.current?.id === wall.id
        )
      });
    });

    // Portas
    doors.forEach(door => {
      const wall = walls.find(w => w.id === door.wallId);
      if (!wall) return;
      const pos = to3D(door.position, 0);
      const dist = distance3D(pos, cameraRef.current.position);
      renderList.push({
        type: 'door',
        id: door.id,
        distance: dist,
        render: () => drawDoor3D(ctx, door, wall, vpMatrix, width, height, selection?.id === door.id)
      });
    });

    // Janelas
    windows.forEach(window => {
      const wall = walls.find(w => w.id === window.wallId);
      if (!wall) return;
      const pos = to3D(window.position, window.sillHeight);
      const dist = distance3D(pos, cameraRef.current.position);
      renderList.push({
        type: 'window',
        id: window.id,
        distance: dist,
        render: () => drawWindow3D(ctx, window, wall, vpMatrix, width, height, selection?.id === window.id)
      });
    });

    // Móveis
    furniture.forEach(item => {
      const pos = to3D(item.position, 0);
      const dist = distance3D(pos, cameraRef.current.position);
      renderList.push({
        type: 'furniture',
        id: item.id,
        distance: dist,
        render: () => drawFurniture3D(ctx, item, vpMatrix, width, height,
          selection?.type === 'furniture' && selection.id === item.id,
          hoveredRef.current?.type === 'furniture' && hoveredRef.current?.id === item.id
        )
      });
    });

    // Ordenar do mais distante para o mais próximo
    renderList.sort((a, b) => b.distance - a.distance);

    // Renderizar
    renderList.forEach(item => item.render());

    // Grid no chão
    drawFloorGrid(ctx, vpMatrix, width, height);

  }, [walls, rooms, doors, windows, furniture, selection]);

  const drawRoomFloor = (
    ctx: CanvasRenderingContext2D,
    room: { points: { x: number; y: number }[]; color: string },
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    const points3D = room.points.map(p => to3D(p, 0));
    const projected = points3D.map(p => project3DTo2D(p, { m: [] }, vpMatrix, width, height));

    if (projected.some(p => !p.visible)) return;

    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i++) {
      ctx.lineTo(projected[i].x, projected[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = isSelected ? room.color + 'CC' : room.color + '99';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#1976d2' : '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const drawWall3D = (
    ctx: CanvasRenderingContext2D,
    wall: Wall,
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const h = wall.height;
    const th = wall.thickness;
    
    const p1 = to3D({ x: wall.start.x - th/2, y: wall.start.y - th/2 }, 0);
    const p2 = to3D({ x: wall.end.x - th/2, y: wall.end.y - th/2 }, 0);
    const p3 = to3D({ x: wall.end.x + th/2, y: wall.end.y + th/2 }, 0);
    const p4 = to3D({ x: wall.start.x + th/2, y: wall.start.y + th/2 }, 0);
    const p5 = to3D({ x: wall.start.x - th/2, y: wall.start.y - th/2 }, h);
    const p6 = to3D({ x: wall.end.x - th/2, y: wall.end.y - th/2 }, h);
    const p7 = to3D({ x: wall.end.x + th/2, y: wall.end.y + th/2 }, h);
    const p8 = to3D({ x: wall.start.x + th/2, y: wall.start.y + th/2 }, h);

    const faces = [
      [p1, p2, p6, p5], // Frente
      [p2, p3, p7, p6], // Direita
      [p3, p4, p8, p7], // Trás
      [p4, p1, p5, p8], // Esquerda
      [p5, p6, p7, p8]  // Topo
    ];

    const color = isSelected ? '#90caf9' : isHovered ? '#e3f2fd' : '#f5f5f5';
    const strokeColor = isSelected ? '#1976d2' : '#bdbdbd';

    faces.forEach(face => {
      const projected = face.map(p => project3DTo2D(p, { m: [] }, vpMatrix, width, height));
      if (projected.some(p => !p.visible)) return;

      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i++) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const drawDoor3D = (
    ctx: CanvasRenderingContext2D,
    door: { position: { x: number; y: number }; width: number; height: number },
    wall: Wall,
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    const dw = door.width;
    const dh = door.height;
    const pos = door.position;

    // Frame da porta
    const frame = [
      to3D({ x: pos.x - dw/2, y: pos.y }, 0),
      to3D({ x: pos.x + dw/2, y: pos.y }, 0),
      to3D({ x: pos.x + dw/2, y: pos.y }, dh),
      to3D({ x: pos.x - dw/2, y: pos.y }, dh)
    ];

    const projected = frame.map(p => project3DTo2D(p, { m: [] }, vpMatrix, width, height));
    
    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i++) {
      ctx.lineTo(projected[i].x, projected[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = isSelected ? '#a1887f' : '#8d6e63';
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawWindow3D = (
    ctx: CanvasRenderingContext2D,
    window: { position: { x: number; y: number }; width: number; height: number; sillHeight: number },
    wall: Wall,
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean
  ) => {
    const ww = window.width;
    const wh = window.height;
    const sh = window.sillHeight;
    const pos = window.position;

    const frame = [
      to3D({ x: pos.x - ww/2, y: pos.y }, sh),
      to3D({ x: pos.x + ww/2, y: pos.y }, sh),
      to3D({ x: pos.x + ww/2, y: pos.y }, sh + wh),
      to3D({ x: pos.x - ww/2, y: pos.y }, sh + wh)
    ];

    const projected = frame.map(p => project3DTo2D(p, { m: [] }, vpMatrix, width, height));
    
    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i++) {
      ctx.lineTo(projected[i].x, projected[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = isSelected ? '#b3e5fc' : '#81d4fa';
    ctx.fill();
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vidro
    ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
    ctx.fill();
  };

  const drawFurniture3D = (
    ctx: CanvasRenderingContext2D,
    item: Furniture,
    vpMatrix: { m: number[] },
    width: number,
    height: number,
    isSelected: boolean,
    isHovered: boolean
  ) => {
    const w = item.width;
    const h = item.height;
    const d = item.depth;
    const pos = item.position;
    const rot = item.rotation;

    const cos = Math.cos(rot);
    const sin = Math.sin(rot);

    const localCorners = [
      { x: -w/2, z: -d/2 },
      { x: w/2, z: -d/2 },
      { x: w/2, z: d/2 },
      { x: -w/2, z: d/2 }
    ];

    const worldCorners = localCorners.map(c => ({
      x: pos.x + c.x * cos - c.z * sin,
      y: pos.y + c.x * sin + c.z * cos
    }));

    const bottom = worldCorners.map(p => to3D(p, 0));
    const top = worldCorners.map(p => to3D(p, h));

    const faces = [
      [bottom[0], bottom[1], top[1], top[0]],
      [bottom[1], bottom[2], top[2], top[1]],
      [bottom[2], bottom[3], top[3], top[2]],
      [bottom[3], bottom[0], top[0], top[3]],
      [top[0], top[1], top[2], top[3]]
    ];

    const color = isSelected ? item.color : isHovered ? lightenColor(item.color, 20) : item.color;
    const strokeColor = isSelected ? '#1976d2' : '#666';

    faces.forEach(face => {
      const projected = face.map(p => project3DTo2D(p, { m: [] }, vpMatrix, width, height));
      if (projected.some(p => !p.visible)) return;

      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i++) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
    });
  };

  const drawFloorGrid = (
    ctx: CanvasRenderingContext2D,
    vpMatrix: { m: number[] },
    width: number,
    height: number
  ) => {
    const gridSize = 100;
    const gridCount = 20;

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;

    for (let i = -gridCount; i <= gridCount; i++) {
      const p1 = to3D({ x: i * gridSize, y: -gridCount * gridSize }, 0);
      const p2 = to3D({ x: i * gridSize, y: gridCount * gridSize }, 0);
      const proj1 = project3DTo2D(p1, { m: [] }, vpMatrix, width, height);
      const proj2 = project3DTo2D(p2, { m: [] }, vpMatrix, width, height);

      if (proj1.visible && proj2.visible) {
        ctx.beginPath();
        ctx.moveTo(proj1.x, proj1.y);
        ctx.lineTo(proj2.x, proj2.y);
        ctx.stroke();
      }
    }

    for (let i = -gridCount; i <= gridCount; i++) {
      const p1 = to3D({ x: -gridCount * gridSize, y: i * gridSize }, 0);
      const p2 = to3D({ x: gridCount * gridSize, y: i * gridSize }, 0);
      const proj1 = project3DTo2D(p1, { m: [] }, vpMatrix, width, height);
      const proj2 = project3DTo2D(p2, { m: [] }, vpMatrix, width, height);

      if (proj1.visible && proj2.visible) {
        ctx.beginPath();
        ctx.moveTo(proj1.x, proj1.y);
        ctx.lineTo(proj2.x, proj2.y);
        ctx.stroke();
      }
    }
  };

  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      render();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isRotatingRef.current = true;
      return;
    }

    // Raycast para seleção
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const projMatrix = createPerspectiveMatrix(Math.PI / 4, canvas.width / canvas.height, 1, 5000);
    const viewMatrix = createLookAtMatrix(
      cameraRef.current.position,
      cameraRef.current.target,
      { x: 0, y: 1, z: 0 }
    );

    const ray = screenToRay(x, y, canvas.width, canvas.height, viewMatrix, projMatrix);

    let closestHit: { type: string; id: string; distance: number; point: Vector3 } | null = null;

    // Testar paredes
    walls.forEach(wall => {
      const hit = rayIntersectWall(ray, wall);
      if (hit.hit && (!closestHit || hit.distance < closestHit.distance)) {
        closestHit = { type: 'wall', id: wall.id, distance: hit.distance, point: hit.point };
      }
    });

    // Testar móveis
    furniture.forEach(item => {
      const hit = rayIntersectFurniture(ray, item);
      if (hit.hit && (!closestHit || hit.distance < closestHit.distance)) {
        closestHit = { type: 'furniture', id: item.id, distance: hit.distance, point: hit.point };
      }
    });

    if (closestHit) {
      setSelection({ type: closestHit.type as 'wall' | 'furniture', id: closestHit.id });
      
      if (closestHit.type === 'furniture') {
        const item = furniture.find(f => f.id === closestHit!.id);
        if (item) {
          draggedObjectRef.current = {
            type: 'furniture',
            id: item.id,
            startPos: { x: item.position.x, y: item.position.y, z: 0 },
            startY: item.position.y
          };
          planeYRef.current = closestHit.point.y;
          isDraggingRef.current = true;
        }
      } else if (closestHit.type === 'wall') {
        const wall = walls.find(w => w.id === closestHit!.id);
        if (wall) {
          draggedObjectRef.current = {
            type: 'wall',
            id: wall.id,
            startPos: { x: wall.start.x, y: wall.start.y, z: wall.end.x, z: wall.end.y },
            startY: 0
          };
          planeYRef.current = 0;
          isDraggingRef.current = true;
        }
      }
    } else {
      setSelection(null);
      isDraggingRef.current = true;
    }
  }, [walls, furniture, setSelection]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    if (isRotatingRef.current) {
      cameraRef.current.azimuth -= dx * 0.01;
      cameraRef.current.polar = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraRef.current.polar + dy * 0.01));
      updateCamera();
      render();
      return;
    }

    if (draggedObjectRef.current && isDraggingRef.current) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const projMatrix = createPerspectiveMatrix(Math.PI / 4, canvas.width / canvas.height, 1, 5000);
      const viewMatrix = createLookAtMatrix(
        cameraRef.current.position,
        cameraRef.current.target,
        { x: 0, y: 1, z: 0 }
      );

      const ray = screenToRay(x, y, canvas.width, canvas.height, viewMatrix, projMatrix);

      // Interseção com plano Y = planeYRef.current
      if (Math.abs(ray.direction.y) > 0.001) {
        const t = (planeYRef.current - ray.origin.y) / ray.direction.y;
        const hitPoint = {
          x: ray.origin.x + ray.direction.x * t,
          y: ray.origin.z + ray.direction.z * t
        };

        if (draggedObjectRef.current.type === 'furniture') {
          updateFurniture(draggedObjectRef.current.id, {
            position: { x: hitPoint.x, y: hitPoint.y }
          });
        } else if (draggedObjectRef.current.type === 'wall') {
          const wall = walls.find(w => w.id === draggedObjectRef.current!.id);
          if (wall) {
            const dx = hitPoint.x - draggedObjectRef.current.startPos.x;
            const dy = hitPoint.y - draggedObjectRef.current.startPos.y;
            updateWall(draggedObjectRef.current.id, {
              start: { x: wall.start.x + dx, y: wall.start.y + dy },
              end: { x: wall.end.x + dx, y: wall.end.y + dy }
            });
            draggedObjectRef.current.startPos.x = hitPoint.x;
            draggedObjectRef.current.startPos.y = hitPoint.y;
          }
        }
      }
      return;
    }

    if (isDraggingRef.current && !draggedObjectRef.current) {
      // Pan
      const forward = {
        x: Math.cos(cameraRef.current.azimuth),
        z: Math.sin(cameraRef.current.azimuth)
      };
      const right = {
        x: Math.sin(cameraRef.current.azimuth),
        z: -Math.cos(cameraRef.current.azimuth)
      };

      const panSpeed = cameraRef.current.distance * 0.002;
      cameraRef.current.target.x += right.x * dx * panSpeed + forward.x * dy * panSpeed;
      cameraRef.current.target.z += right.z * dx * panSpeed + forward.z * dy * panSpeed;
      updateCamera();
      render();
    }
  }, [updateCamera, render, updateFurniture, updateWall, walls]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    isRotatingRef.current = false;
    draggedObjectRef.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const factor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
    cameraRef.current.distance = Math.max(100, Math.min(2000, cameraRef.current.distance * factor));
    updateCamera();
    render();
  }, [updateCamera, render]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const projMatrix = createPerspectiveMatrix(Math.PI / 4, canvas.width / canvas.height, 1, 5000);
    const viewMatrix = createLookAtMatrix(
      cameraRef.current.position,
      cameraRef.current.target,
      { x: 0, y: 1, z: 0 }
    );

    const ray = screenToRay(x, y, canvas.width, canvas.height, viewMatrix, projMatrix);

    // Rotacionar móvel no double click
    furniture.forEach(item => {
      const hit = rayIntersectFurniture(ray, item);
      if (hit.hit) {
        updateFurniture(item.id, { rotation: item.rotation + Math.PI / 2 });
      }
    });
  }, [furniture, updateFurniture]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
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
          display: 'block',
          cursor: isRotatingRef.current ? 'grabbing' : 'default'
        }}
      />
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        background: 'rgba(255,255,255,0.9)',
        padding: '12px',
        borderRadius: 8,
        fontSize: 12,
        pointerEvents: 'none'
      }}>
        <div>🖱️ Drag: Mover objeto/Pan</div>
        <div>🖱️ Alt+Drag: Rotar câmera</div>
        <div>🖱️ Double Click: Rotar móvel</div>
        <div>🖱️ Scroll: Zoom</div>
      </div>
    </div>
  );
}
