import { useUIStore } from '@/store/uiStore';
import { useProjectStore } from '@/store/projectStore';

export function StatusBar() {
  const { activeTool, snapToGrid, setSnapToGrid, gridSize } = useUIStore();
  const { walls, rooms, furniture } = useProjectStore();

  const toolNames: Record<string, string> = {
    select: 'Selecionar',
    wall: 'Desenhar Parede',
    room: 'Desenhar Cômodo',
    door: 'Inserir Porta',
    window: 'Inserir Janela',
    furniture: 'Inserir Móvel',
  };

  return (
    <div className="h-8 bg-gray-100 border-t border-gray-300 flex items-center px-4 justify-between text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-800">
          {toolNames[activeTool] || activeTool}
        </span>
        <span className="text-gray-400">|</span>
        <span>
          Paredes: {walls.length} | Cômodos: {rooms.length} | Móveis: {furniture.length}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Snap to Grid ({gridSize}cm)</span>
        </label>
      </div>
    </div>
  );
}
