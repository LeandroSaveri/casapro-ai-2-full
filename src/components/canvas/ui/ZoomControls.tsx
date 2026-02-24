// src/components/canvas/ui/ZoomControls.tsx
import { useUIStore } from '@/store/uiStore';

export function ZoomControls() {
  const { zoomIn, zoomOut, resetView, zoom } = useUIStore();

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      right: '16px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      zIndex: 100
    }}>
      <button
        onClick={zoomIn}
        style={{
          width: '36px',
          height: '36px',
          border: 'none',
          borderRadius: '6px',
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        +
      </button>
      <button
        onClick={resetView}
        style={{
          width: '36px',
          height: '36px',
          border: 'none',
          borderRadius: '6px',
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={zoomOut}
        style={{
          width: '36px',
          height: '36px',
          border: 'none',
          borderRadius: '6px',
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        −
      </button>
    </div>
  );
}
