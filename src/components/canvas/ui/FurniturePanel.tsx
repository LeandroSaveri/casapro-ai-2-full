// src/components/canvas/ui/FurniturePanel.tsx
import { useUIStore } from '@/store/uiStore';
import { furnitureCatalog, getFurnitureByCategory } from '@/data/furnitureData';
import type { FurnitureCategory } from '@/types/canvas';

const categories: { id: FurnitureCategory; name: string; icon: string }[] = [
  { id: 'living', name: 'Sala', icon: '🛋️' },
  { id: 'bedroom', name: 'Quarto', icon: '🛏️' },
  { id: 'kitchen', name: 'Cozinha', icon: '🍳' },
  { id: 'bathroom', name: 'Banheiro', icon: '🚿' }
];

export function FurniturePanel() {
  const { 
    furniturePanelOpen, 
    setFurniturePanelOpen, 
    selectedFurnitureCategory, 
    setSelectedFurnitureCategory,
    setSelectedFurnitureTemplate,
    setActiveTool
  } = useUIStore();

  if (!furniturePanelOpen) return null;

  const items = selectedFurnitureCategory 
    ? getFurnitureByCategory(selectedFurnitureCategory)
    : [];

  const handleSelectFurniture = (templateId: string) => {
    setSelectedFurnitureTemplate(templateId);
    setActiveTool('furniture');
    setFurniturePanelOpen(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '280px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Catálogo de Móveis</h3>
        <button
          onClick={() => setFurniturePanelOpen(false)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedFurnitureCategory(cat.id)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: selectedFurnitureCategory === cat.id ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
        {selectedFurnitureCategory ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelectFurniture(item.id)}
                style={{
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '32px' }}>{item.icon}</span>
                <span style={{ fontSize: '12px', textAlign: 'center' }}>{item.name}</span>
                <span style={{ fontSize: '10px', color: '#999' }}>
                  {item.width}×{item.height}cm
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
            Selecione uma categoria
          </div>
        )}
      </div>
    </div>
  );
}
