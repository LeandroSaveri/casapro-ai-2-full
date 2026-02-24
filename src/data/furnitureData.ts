// src/data/furnitureData.ts
import type { FurnitureTemplate } from '@/types/canvas';

export const furnitureCatalog: FurnitureTemplate[] = [
  { id: 'sofa-3', name: 'Sofá 3 Lugares', category: 'living', width: 220, height: 90, depth: 85, icon: '🛋️', defaultColor: '#8d6e63' },
  { id: 'sofa-2', name: 'Sofá 2 Lugares', category: 'living', width: 180, height: 90, depth: 85, icon: '🛋️', defaultColor: '#8d6e63' },
  { id: 'tv-stand', name: 'Rack TV', category: 'living', width: 180, height: 50, depth: 45, icon: '📺', defaultColor: '#5d4037' },
  { id: 'coffee-table', name: 'Mesa de Centro', category: 'living', width: 100, height: 45, depth: 60, icon: '☕', defaultColor: '#8d6e63' },
  { id: 'armchair', name: 'Poltrona', category: 'living', width: 80, height: 85, depth: 80, icon: '🪑', defaultColor: '#6d4c41' },
  { id: 'bookshelf', name: 'Estante', category: 'living', width: 120, height: 200, depth: 35, icon: '📚', defaultColor: '#5d4037' },
  
  { id: 'bed-king', name: 'Cama King', category: 'bedroom', width: 200, height: 210, depth: 45, icon: '🛏️', defaultColor: '#fff8e1' },
  { id: 'bed-queen', name: 'Cama Queen', category: 'bedroom', width: 160, height: 200, depth: 45, icon: '🛏️', defaultColor: '#fff8e1' },
  { id: 'bed-single', name: 'Cama Solteiro', category: 'bedroom', width: 100, height: 200, depth: 45, icon: '🛏️', defaultColor: '#fff8e1' },
  { id: 'wardrobe', name: 'Guarda-Roupa', category: 'bedroom', width: 200, height: 220, depth: 60, icon: '🚪', defaultColor: '#6d4c41' },
  { id: 'nightstand', name: 'Criado Mudo', category: 'bedroom', width: 50, height: 55, depth: 45, icon: '🛏️', defaultColor: '#8d6e63' },
  { id: 'dresser', name: 'Cômoda', category: 'bedroom', width: 120, height: 80, depth: 50, icon: '🪑', defaultColor: '#8d6e63' },
  
  { id: 'fridge', name: 'Geladeira', category: 'kitchen', width: 80, height: 180, depth: 70, icon: '🧊', defaultColor: '#e3f2fd' },
  { id: 'stove', name: 'Fogão', category: 'kitchen', width: 60, height: 75, depth: 60, icon: '🔥', defaultColor: '#424242' },
  { id: 'sink', name: 'Pia', category: 'kitchen', width: 80, height: 60, depth: 60, icon: '🚰', defaultColor: '#cfd8dc' },
  { id: 'kitchen-cabinet', name: 'Armário Cozinha', category: 'kitchen', width: 60, height: 80, depth: 60, icon: '🚪', defaultColor: '#8d6e63' },
  { id: 'island', name: 'Ilha', category: 'kitchen', width: 150, height: 90, depth: 80, icon: '🏝️', defaultColor: '#d7ccc8' },
  { id: 'dining-table', name: 'Mesa Jantar', category: 'kitchen', width: 160, height: 90, depth: 90, icon: '🍽️', defaultColor: '#8d6e63' },
  
  { id: 'toilet', name: 'Vaso Sanitário', category: 'bathroom', width: 45, height: 70, depth: 75, icon: '🚽', defaultColor: '#ffffff' },
  { id: 'sink-bath', name: 'Lavatório', category: 'bathroom', width: 60, height: 50, depth: 45, icon: '🚰', defaultColor: '#ffffff' },
  { id: 'shower', name: 'Box Chuveiro', category: 'bathroom', width: 90, height: 90, depth: 90, icon: '🚿', defaultColor: '#b3e5fc' },
  { id: 'bathtub', name: 'Banheira', category: 'bathroom', width: 170, height: 75, depth: 80, icon: '🛁', defaultColor: '#ffffff' },
  { id: 'towel-rack', name: 'Toalheiro', category: 'bathroom', width: 60, height: 20, depth: 15, icon: '🧴', defaultColor: '#cfd8dc' },
];

export function getFurnitureByCategory(category: string): FurnitureTemplate[] {
  return furnitureCatalog.filter(f => f.category === category);
}

export function getFurnitureTemplate(id: string): FurnitureTemplate | undefined {
  return furnitureCatalog.find(f => f.id === id);
}
