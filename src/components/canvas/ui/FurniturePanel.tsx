import { useUIStore } from '@/store/uiStore';
import { furnitureCatalog, getFurnitureByCategory } from '@/data/furnitureData';
import type { FurnitureTemplate } from '@/types/canvas';

const categories = [
  { id: 'living', name: 'Sala', icon: '🛋️' },
  { id: 'bedroom', name: 'Quarto', icon: '🛏️' },
  { id: 'kitchen', name: 'Cozinha', icon: '🍳' },
  { id: 'bathroom', name: 'Banheiro', icon: '🚿' },
];

export function FurniturePanel() {
  const { 
    furniturePanelOpen, 
    setFurniturePanelOpen, 
    selectedFurnitureTemplate, 
    setSelectedFurnitureTemplate,
    setActiveTool 
  } = useUIStore();

  if (!furniturePanelOpen) return null;

  const handleSelectTemplate = (template: FurnitureTemplate) => {
    setSelectedFurnitureTemplate(template.id);
    setFurniturePanelOpen(false);
    setActiveTool('furniture');
  };

  return (
    <div className="absolute right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Catálogo de Móveis</h3>
        <button
          onClick={() => setFurniturePanelOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-4">
        {categories.map(category => {
          const items = getFurnitureByCategory(category.id);
          if (items.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-6">
              <h4 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTemplate(item)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedFurnitureTemplate === item.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-medium text-gray-800 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.width}×{item.height}cm
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
