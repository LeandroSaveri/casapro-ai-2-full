import { useProjectStore } from '@/store/projectStore';
import { useState } from 'react';

export function ExportPanel() {
  const { walls, rooms, doors, windows, furniture } = useProjectStore();
  const [format, setFormat] = useState<'json' | 'svg' | 'pdf'>('json');

  const handleExport = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      project: {
        walls,
        rooms,
        doors,
        windows,
        furniture
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casapro-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Exportar Projeto</h3>
      
      <div className="space-y-3 mb-4">
        <label className="block text-sm font-medium text-gray-700">Formato</label>
        <div className="flex gap-2">
          {(['json', 'svg', 'pdf'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                format === f 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Paredes: {walls.length}</p>
        <p>Cômodos: {rooms.length}</p>
        <p>Portas: {doors.length}</p>
        <p>Janelas: {windows.length}</p>
        <p>Móveis: {furniture.length}</p>
      </div>

      <button
        onClick={handleExport}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
      >
        Exportar como {format.toUpperCase()}
      </button>
    </div>
  );
}
