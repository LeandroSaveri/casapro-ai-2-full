// src/hooks/useCanvasTransform.ts
import { useCallback, useRef, useEffect, useState } from 'react';
import type { Point, Transform } from '@/types/geometry';

interface CanvasTransform {
  transform: Transform;
  toWorld: (screenPoint: Point) => Point;
  toScreen: (worldPoint: Point) => Point;
  pan: (deltaX: number, deltaY: number) => void;
  zoom: (factor: number, center: Point) => void;
  reset: () => void;
}

export function useCanvasTransform(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  initialTransform: Transform = { x: 0, y: 0, scale: 1, rotation: 0 }
): CanvasTransform {
  const [transform, setTransform] = useState<Transform>(initialTransform);
  const transformRef = useRef(transform);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const toWorld = useCallback((screenPoint: Point): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return screenPoint;

    const rect = canvas.getBoundingClientRect();
    const x = screenPoint.x - rect.left;
    const y = screenPoint.y - rect.top;

    return {
      x: (x - transformRef.current.x) / transformRef.current.scale,
      y: (y - transformRef.current.y) / transformRef.current.scale
    };
  }, [canvasRef]);

  const toScreen = useCallback((worldPoint: Point): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return worldPoint;

    const rect = canvas.getBoundingClientRect();
    const x = worldPoint.x * transformRef.current.scale + transformRef.current.x;
    const y = worldPoint.y * transformRef.current.scale + transformRef.current.y;

    return {
      x: x + rect.left,
      y: y + rect.top
    };
  }, [canvasRef]);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, []);

  const zoom = useCallback((factor: number, center: Point) => {
    setTransform(prev => {
      const canvas = canvasRef.current;
      if (!canvas) return prev;

      const rect = canvas.getBoundingClientRect();
      const canvasCenterX = center.x - rect.left;
      const canvasCenterY = center.y - rect.top;

      const worldX = (canvasCenterX - prev.x) / prev.scale;
      const worldY = (canvasCenterY - prev.y) / prev.scale;

      const newScale = Math.max(0.1, Math.min(5, prev.scale * factor));

      const newX = canvasCenterX - worldX * newScale;
      const newY = canvasCenterY - worldY * newScale;

      return {
        ...prev,
        x: newX,
        y: newY,
        scale: newScale
      };
    });
  }, [canvasRef]);

  const reset = useCallback(() => {
    setTransform(initialTransform);
  }, [initialTransform]);

  return {
    transform,
    toWorld,
    toScreen,
    pan,
    zoom,
    reset
  };
}
