// src/App.tsx (atualizado)
import { useState } from 'react';
import { Canvas2D } from './components/canvas/Canvas2D';
import { Canvas3D } from './components/canvas3d/Canvas3D';

function App() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 16,
        right: 320,
        zIndex: 1000,
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: 4,
        display: 'flex',
        gap: 4
      }}>
        <button
          onClick={() => setViewMode('2d')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 6,
            background: viewMode === '2d' ? '#1976d2' : '#f5f5f5',
            color: viewMode === '2d' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: viewMode === '2d' ? 'bold' : 'normal'
          }}
        >
          2D Planta
        </button>
        <button
          onClick={() => setViewMode('3d')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 6,
            background: viewMode === '3d' ? '#1976d2' : '#f5f5f5',
            color: viewMode === '3d' ? 'white' : '#333',
            cursor: 'pointer',
            fontWeight: viewMode === '3d' ? 'bold' : 'normal'
          }}
        >
          3D Vista
        </button>
      </div>
      
      {viewMode === '2d' ? <Canvas2D /> : <Canvas3D />}
    </div>
  );
}

export default App;
