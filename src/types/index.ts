// Re-export all types from individual files
export * from './canvas'
export * from './furniture'
export * from './api'

// Common utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type ID = string
export type Timestamp = number

export interface BaseEntity {
  id: ID
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Vector2D = {
  x: number
  y: number
}

export type Vector3D = {
  x: number
  y: number
  z: number
}

export type Dimensions = {
  width: number
  height: number
  depth?: number
}

export type Bounds = {
  min: Vector2D
  max: Vector2D
}

export type Color = {
  r: number
  g: number
  b: number
  a?: number
}

export type HexColor = string

export interface ValidationError {
  field: string
  message: string
  code: string
}

export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

export type SortDirection = 'asc' | 'desc'

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith'

export interface Filter<T = any> {
  field: keyof T
  operator: FilterOperator
  value: any
}
