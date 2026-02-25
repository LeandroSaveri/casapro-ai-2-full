import type { HexColor } from '@/types'

// App Info
export const APP_NAME = 'CasaPro AI'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Design your dream home with AI-powered tools'

// Canvas Defaults
export const DEFAULT_CANVAS_WIDTH = 1200
export const DEFAULT_CANVAS_HEIGHT = 800
export const DEFAULT_GRID_SIZE = 20
export const DEFAULT_SNAP_DISTANCE = 10
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 10
export const ZOOM_STEP = 0.1

// Wall Defaults
export const DEFAULT_WALL_THICKNESS = 0.15 // meters
export const DEFAULT_WALL_HEIGHT = 2.8 // meters
export const MIN_WALL_THICKNESS = 0.05
export const MAX_WALL_THICKNESS = 0.5
export const MIN_WALL_HEIGHT = 2.0
export const MAX_WALL_HEIGHT = 5.0

// Room Defaults
export const DEFAULT_CEILING_HEIGHT = 2.8
export const MIN_ROOM_AREA = 1 // square meter

// 3D View Defaults
export const DEFAULT_FOV = 50
export const DEFAULT_CAMERA_POSITION = { x: 10, y: 10, z: 10 }
export const DEFAULT_CAMERA_TARGET = { x: 0, y: 0, z: 0 }
export const NEAR_PLANE = 0.1
export const FAR_PLANE = 1000

// Colors
export const DEFAULT_WALL_COLOR: HexColor = '#e5e7eb'
export const DEFAULT_FLOOR_COLOR: HexColor = '#f3f4f6'
export const DEFAULT_CEILING_COLOR: HexColor = '#ffffff'
export const DEFAULT_GRID_COLOR: HexColor = '#d1d5db'
export const SELECTION_COLOR: HexColor = '#3b82f6'
export const HOVER_COLOR: HexColor = '#60a5fa'
export const SNAP_INDICATOR_COLOR: HexColor = '#22c55e'

// Room Type Colors
export const ROOM_TYPE_COLORS: Record<string, HexColor> = {
  living: '#fef3c7',
  bedroom: '#dbeafe',
  kitchen: '#dcfce7',
  bathroom: '#cffafe',
  hallway: '#f3e8ff',
  balcony: '#ffedd5',
  custom: '#f3f4f6',
}

// Local Storage Keys
export const STORAGE_KEY_PREFIX = 'casapro:'
export const STORAGE_KEY_PROJECTS = `${STORAGE_KEY_PREFIX}projects`
export const STORAGE_KEY_SETTINGS = `${STORAGE_KEY_PREFIX}settings`
export const STORAGE_KEY_RECENT_FILES = `${STORAGE_KEY_PREFIX}recentFiles`
export const STORAGE_KEY_USER_PREFERENCES = `${STORAGE_KEY_PREFIX}userPreferences`

// API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
export const API_TIMEOUT = 30000 // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
export const ALLOWED_MODEL_TYPES = ['.glb', '.gltf', '.obj', '.fbx']

// Export Settings
export const EXPORT_QUALITY_SETTINGS = {
  low: { scale: 1, jpegQuality: 0.6 },
  medium: { scale: 2, jpegQuality: 0.8 },
  high: { scale: 3, jpegQuality: 0.9 },
  ultra: { scale: 4, jpegQuality: 1.0 },
}

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_AI_SUGGESTIONS: true,
  ENABLE_COLLABORATION: false,
  ENABLE_CLOUD_SYNC: false,
  ENABLE_EXPORT_3D: true,
  ENABLE_MATERIAL_EDITOR: true,
  ENABLE_VR_PREVIEW: false,
}

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  undo: 'mod+z',
  redo: 'mod+shift+z',
  save: 'mod+s',
  delete: 'delete',
  duplicate: 'mod+d',
  selectAll: 'mod+a',
  deselectAll: 'escape',
  zoomIn: 'mod+plus',
  zoomOut: 'mod+minus',
  zoomFit: 'mod+0',
  toggleGrid: 'g',
  toggleSnap: 's',
  toggle2D3D: 'tab',
  panMode: 'space',
  drawMode: 'd',
  measureMode: 'm',
}

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
}

// Debounce/Throttle Delays
export const DEBOUNCE_DELAY = 300
export const THROTTLE_DELAY = 16 // ~60fps
export const AUTO_SAVE_DELAY = 5000
