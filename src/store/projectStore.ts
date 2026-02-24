// src/store/projectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wall, Room, Door, Window, Furniture, Selection } from '@/types/canvas';
import type { Point } from '@/types/geometry';
import { v4 as uuidv4 } from 'uuid';

interface ProjectState {
  walls: Wall[];
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  furniture: Furniture[];
  selection: Selection | null;
  
  addWall: (wall: Omit<Wall, 'id'>) => string;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  
  addRoom: (room: Omit<Room, 'id'>) => string;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  
  addDoor: (door: Omit<Door, 'id'>) => string;
  updateDoor: (id: string, updates: Partial<Door>) => void;
  removeDoor: (id: string) => void;
  
  addWindow: (window: Omit<Window, 'id'>) => string;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  removeWindow: (id: string) => void;
  
  addFurniture: (furniture: Omit<Furniture, 'id'>) => string;
  updateFurniture: (id: string, updates: Partial<Furniture>) => void;
  removeFurniture: (id: string) => void;
  
  setSelection: (selection: Selection | null) => void;
  clearSelection: () => void;
  
  getWallEndpoints: () => Point[];
  getWallLines: () => { start: Point; end: Point; id: string }[];
  
  reset: () => void;
}

const initialState = {
  walls: [],
  rooms: [],
  doors: [],
  windows: [],
  furniture: [],
  selection: null,
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addWall: (wall) => {
        const id = uuidv4();
        set(state => ({ walls: [...state.walls, { ...wall, id }] }));
        return id;
      },

      updateWall: (id, updates) => {
        set(state => ({
          walls: state.walls.map(w => w.id === id ? { ...w, ...updates } : w)
        }));
      },

      removeWall: (id) => {
        set(state => ({
          walls: state.walls.filter(w => w.id !== id),
          rooms: state.rooms.filter(r => !r.walls.includes(id)),
          selection: state.selection?.type === 'wall' && state.selection.id === id ? null : state.selection
        }));
      },

      addRoom: (room) => {
        const id = uuidv4();
        set(state => ({ rooms: [...state.rooms, { ...room, id }] }));
        return id;
      },

      updateRoom: (id, updates) => {
        set(state => ({
          rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates } : r)
        }));
      },

      removeRoom: (id) => {
        set(state => ({
          rooms: state.rooms.filter(r => r.id !== id),
          selection: state.selection?.type === 'room' && state.selection.id === id ? null : state.selection
        }));
      },

      addDoor: (door) => {
        const id = uuidv4();
        set(state => ({ doors: [...state.doors, { ...door, id }] }));
        return id;
      },

      updateDoor: (id, updates) => {
        set(state => ({
          doors: state.doors.map(d => d.id === id ? { ...d, ...updates } : d)
        }));
      },

      removeDoor: (id) => {
        set(state => ({
          doors: state.doors.filter(d => d.id !== id),
          selection: state.selection?.type === 'door' && state.selection.id === id ? null : state.selection
        }));
      },

      addWindow: (window) => {
        const id = uuidv4();
        set(state => ({ windows: [...state.windows, { ...window, id }] }));
        return id;
      },

      updateWindow: (id, updates) => {
        set(state => ({
          windows: state.windows.map(w => w.id === id ? { ...w, ...updates } : w)
        }));
      },

      removeWindow: (id) => {
        set(state => ({
          windows: state.windows.filter(w => w.id !== id),
          selection: state.selection?.type === 'window' && state.selection.id === id ? null : state.selection
        }));
      },

      addFurniture: (furniture) => {
        const id = uuidv4();
        set(state => ({ furniture: [...state.furniture, { ...furniture, id }] }));
        return id;
      },

      updateFurniture: (id, updates) => {
        set(state => ({
          furniture: state.furniture.map(f => f.id === id ? { ...f, ...updates } : f)
        }));
      },

      removeFurniture: (id) => {
        set(state => ({
          furniture: state.furniture.filter(f => f.id !== id),
          selection: state.selection?.type === 'furniture' && state.selection.id === id ? null : state.selection
        }));
      },

      setSelection: (selection) => set({ selection }),
      clearSelection: () => set({ selection: null }),

      getWallEndpoints: () => {
        const endpoints: Point[] = [];
        for (const wall of get().walls) {
          endpoints.push(wall.start, wall.end);
        }
        return endpoints;
      },

      getWallLines: () => {
        return get().walls.map(wall => ({
          start: wall.start,
          end: wall.end,
          id: wall.id
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'casapro-project',
    }
  )
);
