// src/components/canvas/ui/Toolbar.tsx
import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';
import type { ToolType } from '@/types/canvas';

const tools: { id: ToolType; name: string; icon: string }[] = [
  { id: 'select', name: 'Selecionar', icon: '↖️' },
  { id: 'wall', name: 'Parede', icon: '🧱' },
  { id: 'room', name: 'Cômodo', icon: '🏠' },
  { id: 'door', name: 'Porta', icon: '🚪' },
  { id: 'window', name: 'Janela', icon: '🪟' },
  { id: 'furniture', name: 'Móvel', icon: '🛋️' },
];

export function Toolbar() {
  const { activeTool, setActiveTool, setFurniturePanelOpen } = useUIStore();
  const { clearSelection } = useProjectStore();

  const handleToolClick = (toolId: ToolType) => {
    setActiveTool(toolId);
    clearSelection();
    if (toolId === 'furniture') {
      setFurniturePanelOpen(true);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      zIndex: 100
    }}>
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          title={tool.name}
          style={{
            width: '40px',
            height: '40px',
            border: 'none',
            borderRadius: '6px',
            background: activeTool === tool.id ? '#1976d2' : 'transparent',
            color: activeTool === tool.id ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
