// src/store/uiStore.ts
import { create } from 'zustand';
import type { ToolType, FurnitureCategory } from '@/types/canvas';

interface UIState {
  activeTool: ToolType;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
  snapEnabled: boolean;
  furniturePanelOpen: boolean;
  selectedFurnitureCategory: FurnitureCategory | null;
  selectedFurnitureTemplate: string | null;
  
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setFurniturePanelOpen: (open: boolean) => void;
  setSelectedFurnitureCategory: (category: FurnitureCategory | null) => void;
  setSelectedFurnitureTemplate: (template: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'select',
  zoom: 1,
  pan: { x: 0, y: 0 },
  showGrid: true,
  gridSize: 10,
  snapEnabled: true,
  furniturePanelOpen: false,
  selectedFurnitureCategory: null,
  selectedFurnitureTemplate: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  
  setPan: (pan) => set({ pan }),
  
  zoomIn: () => set(state => ({ zoom: Math.min(5, state.zoom * 1.2) })),
  
  zoomOut: () => set(state => ({ zoom: Math.max(0.1, state.zoom / 1.2) })),
  
  resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
  
  setShowGrid: (show) => set({ showGrid: show }),
  
  setGridSize: (size) => set({ gridSize: Math.max(1, size) }),
  
  setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),
  
  setFurniturePanelOpen: (open) => set({ furniturePanelOpen: open }),
  
  setSelectedFurnitureCategory: (category) => set({ selectedFurnitureCategory: category }),
  
  setSelectedFurnitureTemplate: (template) => set({ selectedFurnitureTemplate: template }),
}));
