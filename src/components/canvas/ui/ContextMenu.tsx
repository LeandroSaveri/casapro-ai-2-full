// src/components/canvas/ui/ContextMenu.tsx
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
      style={{
        position: 'absolute',
        left: x,
        top: y,
        background: 'white',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '4px 0',
        minWidth: '120px',
        zIndex: 200
      }}
    >
      <button
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: '8px 16px',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          color: '#d32f2f'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        🗑️ Excluir
      </button>
    </div>
  );
}
