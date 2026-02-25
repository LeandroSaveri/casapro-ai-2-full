import type { ID, Vector2D, Vector3D, Dimensions, HexColor } from './index'

export type FurnitureCategory = 
  | 'seating'
  | 'tables'
  | 'beds'
  | 'storage'
  | 'lighting'
  | 'appliances'
  | 'decor'
  | 'bathroom'
  | 'kitchen'
  | 'office'
  | 'outdoor'
  | 'custom'

export type FurnitureStyle = 
  | 'modern'
  | 'classic'
  | 'minimalist'
  | 'industrial'
  | 'scandinavian'
  | 'bohemian'
  | 'traditional'
  | 'contemporary'
  | 'rustic'
  | 'custom'

export interface FurnitureItem {
  id: ID
  catalogId: ID
  name: string
  category: FurnitureCategory
  style: FurnitureStyle
  dimensions: Dimensions
  position: Vector3D
  rotation: Vector3D
  scale: Vector3D
  color: HexColor
  materialId?: ID
  textureId?: ID
  isVisible: boolean
  isLocked: boolean
  isSelected: boolean
  roomId?: ID
  layer: number
  metadata?: Record<string, any>
}

export interface FurnitureCatalogItem {
  id: ID
  name: string
  description: string
  category: FurnitureCategory
  style: FurnitureStyle
  dimensions: Dimensions
  defaultColor: HexColor
  availableColors: HexColor[]
  materialIds: ID[]
  thumbnailUrl: string
  modelUrl?: string
  modelFormat?: 'glb' | 'gltf' | 'obj' | 'fbx'
  price?: number
  currency?: string
  brand?: string
  tags: string[]
  isPremium: boolean
  popularity: number
  rating: number
  createdAt: number
  updatedAt: number
}

export interface Material {
  id: ID
  name: string
  type: 'wood' | 'metal' | 'glass' | 'fabric' | 'leather' | 'plastic' | 'stone' | 'ceramic' | 'other'
  color: HexColor
  textureUrl?: string
  normalMapUrl?: string
  roughnessMapUrl?: string
  metallicMapUrl?: string
  roughness: number
  metallic: number
  opacity: number
  isTransparent: boolean
  isEmissive: boolean
  emissiveColor?: HexColor
  emissiveIntensity?: number
}

export interface FurnitureTemplate {
  id: ID
  name: string
  description: string
  category: FurnitureCategory
  items: FurnitureItem[]
  thumbnailUrl?: string
  tags: string[]
  isPublic: boolean
  authorId?: ID
  createdAt: number
  updatedAt: number
}

export interface FurniturePlacement {
  item: FurnitureItem
  snapInfo?: {
    type: 'wall' | 'floor' | 'ceiling' | 'furniture'
    targetId: ID
    snapPoint: Vector3D
  }
}

export interface FurnitureGroup {
  id: ID
  name: string
  itemIds: ID[]
  position: Vector3D
  rotation: Vector3D
  isVisible: boolean
  isLocked: boolean
  isSelected: boolean
}

export type FurnitureFilter = {
  categories?: FurnitureCategory[]
  styles?: FurnitureStyle[]
  minPrice?: number
  maxPrice?: number
  searchQuery?: string
  tags?: string[]
  isPremium?: boolean
  sortBy?: 'popularity' | 'rating' | 'price' | 'newest'
  sortDirection?: 'asc' | 'desc'
}
