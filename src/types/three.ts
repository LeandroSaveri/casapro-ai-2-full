// src/types/three.ts
import type { Wall, Room, Door, Window, Furniture } from './canvas';

export interface Scene3DState {
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  furniture: Furniture[];
  selectedId: string | null;
  selectedType: 'wall' | 'room' | 'door' | 'window' | 'furniture' | null;
}

export interface Camera3D {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  zoom: number;
  rotation: { x: number; y: number };
}

export interface RaycastHit {
  object: {
    id: string;
    type: 'wall' | 'room' | 'door' | 'window' | 'furniture';
    data: Wall | Room | Door | Window | Furniture;
  };
  point: { x: number; y: number; z: number };
  distance: number;
}

export type ViewMode3D = '3d' | 'top' | 'front' | 'side';
