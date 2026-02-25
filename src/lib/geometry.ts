import type { Vector2D, Point2D, Wall, Room, Bounds } from '@/types'
import { crossProduct, distance, distanceSquared, addVectors, subtractVectors, multiplyVector, normalizeVector, dotProduct } from './utils'

// Calculate area of a polygon using shoelace formula
export function calculatePolygonArea(points: Vector2D[]): number {
  if (points.length < 3) return 0
  
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  
  return Math.abs(area) / 2
}

// Calculate perimeter of a polygon
export function calculatePolygonPerimeter(points: Vector2D[]): number {
  if (points.length < 2) return 0
  
  let perimeter = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    perimeter += distance(points[i], points[j])
  }
  
  return perimeter
}

// Check if a point is inside a polygon
export function isPointInPolygon(point: Vector2D, polygon: Vector2D[]): boolean {
  if (polygon.length < 3) return false
  
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
    
    if (intersect) inside = !inside
  }
  
  return inside
}

// Find intersection point of two line segments
export function lineIntersection(
  a1: Vector2D,
  a2: Vector2D,
  b1: Vector2D,
  b2: Vector2D
): Vector2D | null {
  const d1 = subtractVectors(a2, a1)
  const d2 = subtractVectors(b2, b1)
  
  const cross = crossProduct(d1, d2)
  
  // Lines are parallel
  if (Math.abs(cross) < 1e-10) return null
  
  const t = crossProduct(subtractVectors(b1, a1), d2) / cross
  
  if (t < 0 || t > 1) return null
  
  const u = crossProduct(subtractVectors(b1, a1), d1) / cross
  
  if (u < 0 || u > 1) return null
  
  return addVectors(a1, multiplyVector(d1, t))
}

// Calculate distance from point to line segment
export function distanceToLineSegment(point: Vector2D, lineStart: Vector2D, lineEnd: Vector2D): number {
  const lineVector = subtractVectors(lineEnd, lineStart)
  const pointVector = subtractVectors(point, lineStart)
  
  const lineLengthSquared = distanceSquared(lineStart, lineEnd)
  
  if (lineLengthSquared === 0) return distance(point, lineStart)
  
  const t = Math.max(0, Math.min(1, dotProduct(pointVector, lineVector) / lineLengthSquared))
  
  const projection = addVectors(lineStart, multiplyVector(lineVector, t))
  
  return distance(point, projection)
}

// Find closest point on line segment
export function closestPointOnLineSegment(
  point: Vector2D,
  lineStart: Vector2D,
  lineEnd: Vector2D
): Vector2D {
  const lineVector = subtractVectors(lineEnd, lineStart)
  const pointVector = subtractVectors(point, lineStart)
  
  const lineLengthSquared = distanceSquared(lineStart, lineEnd)
  
  if (lineLengthSquared === 0) return lineStart
  
  const t = Math.max(0, Math.min(1, dotProduct(pointVector, lineVector) / lineLengthSquared))
  
  return addVectors(lineStart, multiplyVector(lineVector, t))
}

// Calculate wall length
export function getWallLength(wall: Wall, points: Point2D[]): number {
  const startPoint = points.find(p => p.id === wall.startPointId)
  const endPoint = points.find(p => p.id === wall.endPointId)
  
  if (!startPoint || !endPoint) return 0
  
  return distance(startPoint, endPoint)
}

// Calculate wall center point
export function getWallCenter(wall: Wall, points: Point2D[]): Vector2D {
  const startPoint = points.find(p => p.id === wall.startPointId)
  const endPoint = points.find(p => p.id === wall.endPointId)
  
  if (!startPoint || !endPoint) return { x: 0, y: 0 }
  
  return {
    x: (startPoint.x + endPoint.x) / 2,
    y: (startPoint.y + endPoint.y) / 2,
  }
}

// Calculate wall direction vector (normalized)
export function getWallDirection(wall: Wall, points: Point2D[]): Vector2D {
  const startPoint = points.find(p => p.id === wall.startPointId)
  const endPoint = points.find(p => p.id === wall.endPointId)
  
  if (!startPoint || !endPoint) return { x: 1, y: 0 }
  
  const direction = subtractVectors(endPoint, startPoint)
  return normalizeVector(direction)
}

// Calculate wall normal vector (perpendicular, pointing outward)
export function getWallNormal(wall: Wall, points: Point2D[]): Vector2D {
  const direction = getWallDirection(wall, points)
  return { x: -direction.y, y: direction.x }
}

// Calculate room center
export function getRoomCenter(room: Room, points: Point2D[]): Vector2D {
  const roomPoints = room.pointIds
    .map(id => points.find(p => p.id === id))
    .filter((p): p is Point2D => p !== undefined)
  
  if (roomPoints.length === 0) return { x: 0, y: 0 }
  
  const sum = roomPoints.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  )
  
  return {
    x: sum.x / roomPoints.length,
    y: sum.y / roomPoints.length,
  }
}

// Get room polygon points in order
export function getRoomPolygon(room: Room, points: Point2D[]): Vector2D[] {
  return room.pointIds
    .map(id => points.find(p => p.id === id))
    .filter((p): p is Point2D => p !== undefined)
}

// Calculate room bounds
export function getRoomBounds(room: Room, points: Point2D[]): Bounds {
  const polygon = getRoomPolygon(room, points)
  
  if (polygon.length === 0) {
    return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }
  }
  
  const xs = polygon.map(p => p.x)
  const ys = polygon.map(p => p.y)
  
  return {
    min: { x: Math.min(...xs), y: Math.min(...ys) },
    max: { x: Math.max(...xs), y: Math.max(...ys) },
  }
}

// Check if two walls are connected (share a point)
export function areWallsConnected(wall1: Wall, wall2: Wall): boolean {
  return (
    wall1.startPointId === wall2.startPointId ||
    wall1.startPointId === wall2.endPointId ||
    wall1.endPointId === wall2.startPointId ||
    wall1.endPointId === wall2.endPointId
  )
}

// Find connected walls
export function findConnectedWalls(wall: Wall, allWalls: Wall[]): Wall[] {
  return allWalls.filter(w => w.id !== wall.id && areWallsConnected(wall, w))
}

// Calculate angle between two walls
export function angleBetweenWalls(wall1: Wall, wall2: Wall, points: Point2D[]): number {
  const dir1 = getWallDirection(wall1, points)
  const dir2 = getWallDirection(wall2, points)
  
  const dot = dotProduct(dir1, dir2)
  return Math.acos(Math.max(-1, Math.min(1, dot)))
}

// Check if walls form a valid corner (90 degrees with tolerance)
export function isRightAngle(wall1: Wall, wall2: Wall, points: Point2D[], tolerance = 0.1): boolean {
  const angle = angleBetweenWalls(wall1, wall2, points)
  const degrees = (angle * 180) / Math.PI
  
  return Math.abs(degrees - 90) < tolerance || Math.abs(degrees - 270) < tolerance
}

// Offset a polygon outward by a given distance
export function offsetPolygon(polygon: Vector2D[], offset: number): Vector2D[] {
  if (polygon.length < 3) return polygon
  
  const result: Vector2D[] = []
  
  for (let i = 0; i < polygon.length; i++) {
    const prev = polygon[(i - 1 + polygon.length) % polygon.length]
    const curr = polygon[i]
    const next = polygon[(i + 1) % polygon.length]
    
    const v1 = normalizeVector(subtractVectors(curr, prev))
    const v2 = normalizeVector(subtractVectors(next, curr))
    
    const n1 = { x: -v1.y, y: v1.x }
    const n2 = { x: -v2.y, y: v2.x }
    
    const bisector = normalizeVector(addVectors(n1, n2))
    const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct(v1, v2))))
    const factor = offset / Math.sin(angle / 2)
    
    result.push(addVectors(curr, multiplyVector(bisector, factor)))
  }
  
  return result
}

// Simplify polygon by removing collinear points
export function simplifyPolygon(polygon: Vector2D[], tolerance = 0.01): Vector2D[] {
  if (polygon.length < 3) return polygon
  
  const result: Vector2D[] = [polygon[0]]
  
  for (let i = 1; i < polygon.length - 1; i++) {
    const prev = result[result.length - 1]
    const curr = polygon[i]
    const next = polygon[i + 1]
    
    const v1 = normalizeVector(subtractVectors(curr, prev))
    const v2 = normalizeVector(subtractVectors(next, curr))
    
    // Check if points are collinear
    if (Math.abs(crossProduct(v1, v2)) > tolerance) {
      result.push(curr)
    }
  }
  
  result.push(polygon[polygon.length - 1])
  
  // Check if first and last are the same (closed polygon)
  if (result.length > 1 && distance(result[0], result[result.length - 1]) < tolerance) {
    result.pop()
  }
  
  return result
}
