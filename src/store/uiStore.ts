import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  selectedFurnitureTemplate: string | null;
  setSelectedFurnitureTemplate: (template: string | null) => void;
  furniturePanelOpen: boolean;
  setFurniturePanelOpen: (open: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectedFurnitureTemplate: null,
  setSelectedFurnitureTemplate: (template) => set({ selectedFurnitureTemplate: template }),
  furniturePanelOpen: false,
  setFurniturePanelOpen: (open) => set({ furniturePanelOpen: open }),
  showGrid: true,
  setShowGrid: (show) => set({ showGrid: show }),
  gridSize: 10,
  setGridSize: (size) => set({ gridSize: size }),
  snapToGrid: true,
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
}));
