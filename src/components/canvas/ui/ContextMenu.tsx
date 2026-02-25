import { useProjectStore } from '@/store/projectStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const { selection, removeWall, removeRoom, removeDoor, removeWindow, removeFurniture, clearSelection } = useProjectStore();

  const handleDelete = () => {
    if (!selection) return;

    switch (selection.type) {
      case 'wall':
        removeWall(selection.id);
        break;
      case 'room':
        removeRoom(selection.id);
        break;
      case 'door':
        removeDoor(selection.id);
        break;
      case 'window':
        removeWindow(selection.id);
        break;
      case 'furniture':
        removeFurniture(selection.id);
        break;
    }
    clearSelection();
    onClose();
  };

  if (!selection) return null;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[150px]"
      style={{ left: x, top: y }}
    >
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
      >
        <span>🗑️</span>
        Excluir
      </button>
      <div className="border-t border-gray-200 my-1"></div>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}
