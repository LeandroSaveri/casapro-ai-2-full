import React, { useState, useEffect } from 'react';
import { Canvas2D } from '@/components/canvas/Canvas2D';
import { Canvas3D } from '@/components/canvas3d/Canvas3D';
import { Toolbar } from '@/components/canvas/ui/Toolbar';
import { FurniturePanel } from '@/components/canvas/ui/FurniturePanel';
import { StatusBar } from '@/components/canvas/ui/StatusBar';
import { ContextMenu } from '@/components/canvas/ui/ContextMenu';
import { PropertiesPanel } from '@/components/properties/PropertiesPanel';
import { ExportPanel } from '@/components/export/ExportPanel';
import { PlanBadge } from '@/components/billing/PlanBadge';
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';

type ViewMode = '2d' | '3d';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  
  const { sidebarOpen, activePanel, setActivePanel } = useUIStore();
  const { selection, clearSelection } = useProjectStore();

  // Fechar context menu ao clicar
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setViewMode('2d');
      if (e.key === '2') setViewMode('3d');
      if (e.key === 'Escape') {
        clearSelection();
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">CasaPro AI</h1>
          <PlanBadge />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === '2d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === '3d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3D
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePanel(activePanel === 'export' ? null : 'export')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePanel === 'export'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Exportar
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'properties' ? null : 'properties')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePanel === 'properties'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Propriedades
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Toolbar (apenas em modo 2D) */}
        {viewMode === '2d' && (
          <aside className={`w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2 transition-all ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Toolbar />
          </aside>
        )}

        {/* Canvas Area */}
        <main 
          className="flex-1 relative"
          onContextMenu={handleContextMenu}
        >
          {viewMode === '2d' ? (
            <Canvas2D className="w-full h-full" />
          ) : (
            <Canvas3D className="w-full h-full" />
          )}
          
          {/* Furniture Panel (apenas em modo 2D) */}
          {viewMode === '2d' && <FurniturePanel />}
          
          {/* Context Menu */}
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
            />
          )}
          
          {/* Active Panels */}
          {activePanel === 'properties' && <PropertiesPanel />}
          {activePanel === 'export' && <ExportPanel />}
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />
      
      {/* Mode Indicator */}
      <div className="absolute bottom-12 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs font-mono">
        {viewMode.toUpperCase()} MODE • Press 1/2 to switch
      </div>
    </div>
  );
}

export default App;
