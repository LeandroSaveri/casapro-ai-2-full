// src/components/export/ExportPanel.tsx
import { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { exportToJSON, downloadJSON, exportCanvasToImage, downloadImage } from './exportJSON';

export function ExportPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState('Meu Projeto');
  const { walls, rooms, doors, windows, furniture } = useProjectStore();

  const handleExportJSON = () => {
    const json = exportToJSON(walls, rooms, doors, windows, furniture, projectName);
    downloadJSON(json, projectName.replace(/\s+/g, '_'));
  };

  const handleExportImage = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const dataUrl = await exportCanvasToImage(canvas as HTMLCanvasElement);
    downloadImage(dataUrl, `${projectName.replace(/\s+/g, '_')}.png`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: 16,
          right: 520,
          zIndex: 1000,
          padding: '8px 16px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        📤 Exportar
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 520,
      zIndex: 1000,
      background: 'white',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: 16,
      width: 280
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Exportar Projeto</h3>
        <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>

      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Nome do projeto"
        style={{
          width: '100%',
          padding: 8,
          marginBottom: 12,
          border: '1px solid #ddd',
          borderRadius: 4
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={handleExportJSON}
          style={{
            padding: '10px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          💾 Salvar como JSON
        </button>
        
        <button
          onClick={handleExportImage}
          style={{
            padding: '10px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          🖼️ Exportar como Imagem
        </button>
      </div>
    </div>
  );
}
