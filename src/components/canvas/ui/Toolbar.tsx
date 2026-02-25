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
    <div className="flex flex-col gap-1 p-2 bg-white rounded-lg shadow-md">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => handleToolClick(tool.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
            activeTool === tool.id
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={tool.name}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
