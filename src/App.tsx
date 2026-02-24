// src/App.tsx (VERSÃO DEFINITIVA)
import { useState, useEffect } from 'react';
import { Canvas2D } from './components/canvas/Canvas2D';
import { Canvas3D } from './components/canvas3d/Canvas3D';
import { useProjectStore } from './store/projectStore';

function App() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Aguardar hidratação do Zustand
    const unsubscribe = useProjectStore.persist.onFinishHydration(() => {
      setIsLoading(false);
    });
    
    // Se já hidratou
    if (useProjectStore.persist.hasHydrated()) {
      setIsLoading(false);
    }
    
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        gap: 16
      }}>
        <div style={{ fontSize: 24, fontWeight: 'bold' }}>CasaPro</div>
        <div>Carregando seu projeto...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Toggle 2D/3D */}
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
            fontWeight: viewMode === '2d' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>📐</span> 2D Planta
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
            fontWeight: viewMode === '3d' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>🏠</span> 3D Vista
        </button>
      </div>
      
      {viewMode === '2d' ? <Canvas2D /> : <Canvas3D />}
    </div>
  );
}

export default App;
