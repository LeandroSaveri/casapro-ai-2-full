import { useProjectStore } from '@/store/projectStore';
import { useMemo } from 'react';
import type { Wall, Room, Door, Window, Furniture } from '@/types/canvas';

export function PropertiesPanel() {
  const { 
    selection, 
    walls, 
    rooms, 
    doors, 
    windows, 
    furniture, 
    updateWall, 
    updateRoom, 
    updateDoor, 
    updateWindow, 
    updateFurniture 
  } = useProjectStore();

  const selectedObject = useMemo(() => {
    if (!selection) return null;

    switch (selection.type) {
      case 'wall':
        return walls.find(w => w.id === selection.id);
      case 'room':
        return rooms.find(r => r.id === selection.id);
      case 'door':
        return doors.find(d => d.id === selection.id);
      case 'window':
        return windows.find(w => w.id === selection.id);
      case 'furniture':
        return furniture.find(f => f.id === selection.id);
      default:
        return null;
    }
  }, [selection, walls, rooms, doors, windows, furniture]);

  if (!selectedObject || !selection) {
    return (
      <div className="absolute right-4 top-20 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Propriedades</h3>
        <p className="text-gray-500 text-sm">Selecione um objeto para editar</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Wall | Room | Door | Window | Furniture>) => {
    if (!selection) return;
    
    switch (selection.type) {
      case 'wall':
        updateWall(selection.id, updates as Partial<Wall>);
        break;
      case 'room':
        updateRoom(selection.id, updates as Partial<Room>);
        break;
      case 'door':
        updateDoor(selection.id, updates as Partial<Door>);
        break;
      case 'window':
        updateWindow(selection.id, updates as Partial<Window>);
        break;
      case 'furniture':
        updateFurniture(selection.id, updates as Partial<Furniture>);
        break;
    }
  };

  return (
    <div className="absolute right-4 top-20 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-h-[80vh] overflow-y-auto">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>{getIcon(selection.type)}</span>
        {getTitle(selection.type)}
      </h3>

      {'thickness' in selectedObject && (
        <div className="space-y-3 mb-4">
          <NumberInput
            label="Espessura (cm)"
            value={selectedObject.thickness || 5}
            onChange={(v) => handleUpdate({ thickness: v })}
            min={5}
            max={50}
          />
          {'height' in selectedObject && (
            <NumberInput
              label="Altura (cm)"
              value={selectedObject.height || 280}
              onChange={(v) => handleUpdate({ height: v })}
              min={100}
              max={500}
            />
          )}
        </div>
      )}

      {'color' in selectedObject && (
        <div className="mb-4">
          <ColorPicker
            label="Cor"
            value={selectedObject.color || '#E3F2FD'}
            onChange={(v) => handleUpdate({ color: v })}
          />
        </div>
      )}

      {'width' in selectedObject && 'height' in selectedObject && 'rotation' in selectedObject && (
        <div className="space-y-3 mb-4">
          <NumberInput
            label="Largura (cm)"
            value={selectedObject.width}
            onChange={(v) => handleUpdate({ width: v })}
            min={10}
            max={500}
          />
          <NumberInput
            label="Altura (cm)"
            value={selectedObject.height}
            onChange={(v) => handleUpdate({ height: v })}
            min={10}
            max={500}
          />
          <NumberInput
            label="Rotação (°)"
            value={Math.round((selectedObject.rotation * 180) / Math.PI)}
            onChange={(v) => handleUpdate({ rotation: (v * Math.PI) / 180 })}
            min={0}
            max={360}
            step={15}
          />
        </div>
      )}

      {'name' in selectedObject && (
        <div className="mb-4">
          <TextInput
            label="Nome"
            value={selectedObject.name}
            onChange={(v) => handleUpdate({ name: v })}
          />
          {'area' in selectedObject && (
            <p className="text-sm text-gray-600 mt-2">
              Área: {selectedObject.area.toFixed(2)} m²
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function NumberInput({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1 
}: { 
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function TextInput({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ColorPicker({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
}) {
  const colors = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FCE4EC', '#E0F2F1', '#424242', '#8d6e63', '#fff8e1', '#ffffff'];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-5 gap-2">
        {colors.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`w-8 h-8 rounded-full border-2 ${value === c ? 'border-blue-500' : 'border-gray-200'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    wall: '🧱',
    room: '🏠',
    door: '🚪',
    window: '🪟',
    furniture: '🛋️'
  };
  return icons[type] || '📦';
}

function getTitle(type: string): string {
  const titles: Record<string, string> = {
    wall: 'Parede',
    room: 'Cômodo',
    door: 'Porta',
    window: 'Janela',
    furniture: 'Móvel'
  };
  return titles[type] || 'Objeto';
}
