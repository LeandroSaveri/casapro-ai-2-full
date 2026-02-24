// src/components/properties/PropertiesPanel.tsx
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { useMemo } from 'react';

export function PropertiesPanel() {
  const { selection, walls, rooms, doors, windows, furniture, updateWall, updateRoom, updateDoor, updateWindow, updateFurniture } = useProjectStore();
  const { activeTool } = useUIStore();

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

  if (!selectedObject) {
    return (
      <div style={{
        position: 'absolute',
        top: 80,
        right: 16,
        width: 260,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: 16,
        zIndex: 100
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>Propriedades</h4>
        <p style={{ color: '#999', fontSize: 13 }}>Selecione um objeto para editar</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 80,
      right: 16,
      width: 260,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: 16,
      zIndex: 100,
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto'
    }}>
      <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        {getIcon(selection!.type)} {getTitle(selection!.type)}
      </h4>

      {'thickness' in selectedObject && (
        <PropertyGroup title="Dimensões">
          <NumberInput
            label="Espessura (cm)"
            value={selectedObject.thickness}
            onChange={(v) => updateWall(selectedObject.id, { thickness: v })}
            min={5}
            max={50}
          />
          <NumberInput
            label="Altura (cm)"
            value={selectedObject.height}
            onChange={(v) => updateWall(selectedObject.id, { height: v })}
            min={100}
            max={500}
          />
        </PropertyGroup>
      )}

      {'color' in selectedObject && (
        <PropertyGroup title="Aparência">
          <ColorPicker
            label="Cor"
            value={selectedObject.color}
            onChange={(v) => {
              if (selection?.type === 'furniture') updateFurniture(selectedObject.id, { color: v });
              if (selection?.type === 'room') updateRoom(selectedObject.id, { color: v });
            }}
          />
        </PropertyGroup>
      )}

      {'width' in selectedObject && 'height' in selectedObject && 'rotation' in selectedObject && (
        <PropertyGroup title="Transformação">
          <NumberInput
            label="Largura (cm)"
            value={selectedObject.width}
            onChange={(v) => updateFurniture(selectedObject.id, { width: v })}
            min={10}
            max={500}
          />
          <NumberInput
            label="Profundidade (cm)"
            value={selectedObject.height}
            onChange={(v) => updateFurniture(selectedObject.id, { height: v })}
            min={10}
            max={500}
          />
          <NumberInput
            label="Rotação (graus)"
            value={Math.round((selectedObject.rotation * 180) / Math.PI)}
            onChange={(v) => updateFurniture(selectedObject.id, { rotation: (v * Math.PI) / 180 })}
            min={0}
            max={360}
            step={15}
          />
        </PropertyGroup>
      )}

      {'name' in selectedObject && (
        <PropertyGroup title="Informações">
          <TextInput
            label="Nome"
            value={selectedObject.name}
            onChange={(v) => {
              if (selection?.type === 'room') updateRoom(selectedObject.id, { name: v });
            }}
          />
          {'area' in selectedObject && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Área: {selectedObject.area.toFixed(2)} m²
            </div>
          )}
        </PropertyGroup>
      )}

      <button
        onClick={() => {
          const { removeWall, removeRoom, removeDoor, removeWindow, removeFurniture, clearSelection } = useProjectStore.getState();
          switch (selection?.type) {
            case 'wall': removeWall(selection.id); break;
            case 'room': removeRoom(selection.id); break;
            case 'door': removeDoor(selection.id); break;
            case 'window': removeWindow(selection.id); break;
            case 'furniture': removeFurniture(selection.id); break;
          }
          clearSelection();
        }}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: 16,
          background: '#ffebee',
          color: '#c62828',
          border: '1px solid #ef9a9a',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        🗑️ Excluir {getTitle(selection!.type).toLowerCase()}
      </button>
    </div>
  );
}

// Componentes auxiliares
function PropertyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e0e0e0' }}>
      <h5 style={{ margin: '0 0 12px 0', fontSize: 12, textTransform: 'uppercase', color: '#999' }}>{title}</h5>
      {children}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1 }: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{
          width: '100%',
          padding: '6px 10px',
          border: '1px solid #ddd',
          borderRadius: 4,
          fontSize: 14
        }}
      />
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 10px',
          border: '1px solid #ddd',
          borderRadius: 4,
          fontSize: 14
        }}
      />
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const colors = ['#E3F2FD', '#F3E5F5', '#E8F5E9', '#FFF3E0', '#FCE4EC', '#E0F2F1', '#424242', '#8d6e63', '#fff8e1', '#ffffff'];
  
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {colors.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: c,
              border: value === c ? '2px solid #1976d2' : '1px solid #ddd',
              cursor: 'pointer'
            }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 28, height: 28, padding: 0, border: 'none' }}
        />
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
