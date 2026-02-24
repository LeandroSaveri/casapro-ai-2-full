// src/components/canvas/ui/StatusBar.tsx
import { useUIStore } from '@/store/uiStore';

export function StatusBar() {
  const { activeTool, snapEnabled, setSnapEnabled } = useUIStore();

  const toolNames: Record<string, string> = {
    select: 'Selecionar',
    wall: 'Desenhar Parede',
    room: 'Criar Cômodo',
    door: 'Inserir Porta',
    window: 'Inserir Janela',
    furniture: 'Inserir Móvel'
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '32px',
      background: '#f5f5f5',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: '13px',
      color: '#666',
      zIndex: 100
    }}>
      <span>{toolNames[activeTool] || 'Pronto'}</span>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={snapEnabled}
          onChange={(e) => setSnapEnabled(e.target.checked)}
        />
        Snap
      </label>
    </div>
  );
}
