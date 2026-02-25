import type { ID } from './index'

export type APIStatus = 'idle' | 'loading' | 'success' | 'error'

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: APIError
  meta?: APIMeta
}

export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  stack?: string
}

export interface APIMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface PaginatedRequest {
  page?: number
  limit?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface AISuggestionRequest {
  prompt: string
  floorPlanId?: ID
  roomIds?: ID[]
  style?: string
  budget?: number
  constraints?: string[]
  preferences?: Record<string, any>
}

export interface AISuggestionResponse {
  suggestions: DesignSuggestion[]
  reasoning: string
  confidence: number
}

export interface DesignSuggestion {
  id: ID
  type: 'furniture' | 'layout' | 'color' | 'material' | 'lighting' | 'decor'
  title: string
  description: string
  items?: SuggestedItem[]
  changes?: SuggestedChange[]
  previewImageUrl?: string
}

export interface SuggestedItem {
  catalogId: ID
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  reason: string
}

export interface SuggestedChange {
  type: 'move' | 'rotate' | 'scale' | 'replace' | 'remove' | 'add'
  targetId: ID
  newValue: any
  reason: string
}

export interface ExportRequest {
  format: 'png' | 'jpg' | 'pdf' | 'svg' | 'dxf' | 'obj' | 'gltf' | 'json'
  quality?: 'low' | 'medium' | 'high' | 'ultra'
  includeFurniture?: boolean
  includeMeasurements?: boolean
  includeAnnotations?: boolean
  scale?: number
  paperSize?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'letter' | 'legal'
  orientation?: 'portrait' | 'landscape'
}

export interface ExportResult {
  url: string
  filename: string
  format: string
  size: number
  expiresAt: number
}

export interface ShareRequest {
  permission: 'view' | 'edit'
  expiresIn?: number
  password?: string
  allowComments?: boolean
  allowDownload?: boolean
}

export interface ShareResult {
  shareId: ID
  url: string
  expiresAt?: number
  passwordProtected: boolean
}

export interface CollaborationSession {
  sessionId: ID
  floorPlanId: ID
  participants: Participant[]
  startedAt: number
  lastActivityAt: number
}

export interface Participant {
  id: ID
  name: string
  avatarUrl?: string
  color: string
  cursor?: { x: number; y: number }
  isActive: boolean
  joinedAt: number
  lastSeenAt: number
  permissions: ('view' | 'edit' | 'admin')[]
}
