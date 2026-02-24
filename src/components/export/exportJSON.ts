// src/components/export/exportJSON.ts
import type { Wall, Room, Door, Window, Furniture } from '@/types/canvas';

export interface ProjectData {
  version: string;
  createdAt: string;
  modifiedAt: string;
  data: {
    walls: Wall[];
    rooms: Room[];
    doors: Door[];
    windows: Window[];
    furniture: Furniture[];
  };
  metadata: {
    name: string;
    area: number;
    roomCount: number;
    wallCount: number;
  };
}

export function exportToJSON(
  walls: Wall[],
  rooms: Room[],
  doors: Door[],
  windows: Window[],
  furniture: Furniture[],
  projectName: string = 'Meu Projeto'
): string {
  const totalArea = rooms.reduce((sum, r) => sum + r.area, 0);
  
  const project: ProjectData = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    data: { walls, rooms, doors, windows, furniture },
    metadata: {
      name: projectName,
      area: totalArea,
      roomCount: rooms.length,
      wallCount: walls.length
    }
  };

  return JSON.stringify(project, null, 2);
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportCanvasToImage(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1
): Promise<string> {
  return canvas.toDataURL(`image/${format}`, quality);
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
