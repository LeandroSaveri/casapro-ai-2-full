import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Vector2D, Vector3D, Bounds, HexColor, Color } from '@/types'

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID generator
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
}

// Vector operations
export function addVectors(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function subtractVectors(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function multiplyVector(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar }
}

export function divideVector(v: Vector2D, scalar: number): Vector2D {
  if (scalar === 0) throw new Error('Cannot divide by zero')
  return { x: v.x / scalar, y: v.y / scalar }
}

export function vectorLength(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function normalizeVector(v: Vector2D): Vector2D {
  const length = vectorLength(v)
  if (length === 0) return { x: 0, y: 0 }
  return divideVector(v, length)
}

export function dotProduct(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y
}

export function crossProduct(a: Vector2D, b: Vector2D): number {
  return a.x * b.y - a.y * b.x
}

export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function distanceSquared(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return dx * dx + dy * dy
}

export function midpoint(a: Vector2D, b: Vector2D): Vector2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  }
}

// 3D Vector operations
export function addVectors3D(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function subtractVectors3D(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

export function multiplyVector3D(v: Vector3D, scalar: number): Vector3D {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar }
}

export function vectorLength3D(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

export function normalizeVector3D(v: Vector3D): Vector3D {
  const length = vectorLength3D(v)
  if (length === 0) return { x: 0, y: 0, z: 0 }
  return multiplyVector3D(v, 1 / length)
}

export function distance3D(a: Vector3D, b: Vector3D): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

// Color utilities
export function hexToRgb(hex: HexColor): Color {
  const cleanHex = hex.replace('#', '')
  const bigint = parseInt(cleanHex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b, a: 1 }
}

export function rgbToHex(color: Color): HexColor {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(Math.round(color.r))}${toHex(Math.round(color.g))}${toHex(Math.round(color.b))}`
}

export function rgbaToString(color: Color): string {
  const a = color.a ?? 1
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${a})`
}

// Math utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

export function angleBetween(a: Vector2D, b: Vector2D): number {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

// Bounds utilities
export function isPointInBounds(point: Vector2D, bounds: Bounds): boolean {
  return (
    point.x >= bounds.min.x &&
    point.x <= bounds.max.x &&
    point.y >= bounds.min.y &&
    point.y <= bounds.max.y
  )
}

export function expandBounds(bounds: Bounds, padding: number): Bounds {
  return {
    min: { x: bounds.min.x - padding, y: bounds.min.y - padding },
    max: { x: bounds.max.x + padding, y: bounds.max.y + padding },
  }
}

export function unionBounds(a: Bounds, b: Bounds): Bounds {
  return {
    min: { x: Math.min(a.min.x, b.min.x), y: Math.min(a.min.y, b.min.y) },
    max: { x: Math.max(a.max.x, b.max.x), y: Math.max(a.max.y, b.max.y) },
  }
}

// Deep clone
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Throttle
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Local storage with error handling
export function setLocalStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
    return false
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
    return defaultValue
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('Failed to remove from localStorage:', e)
  }
}

// Formatting
export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}

export function formatArea(area: number, unit: string): string {
  return `${formatNumber(area)} ${unit}²`
}

export function formatDistance(distance: number, unit: string): string {
  return `${formatNumber(distance)} ${unit}`
}

// Validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}
