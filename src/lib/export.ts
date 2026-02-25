import type { FloorPlan, ExportRequest, ExportResult } from '@/types'
import { EXPORT_QUALITY_SETTINGS } from './constants'

// Export floor plan to JSON
export function exportToJSON(floorPlan: FloorPlan): string {
  return JSON.stringify(floorPlan, null, 2)
}

// Import floor plan from JSON
export function importFromJSON(json: string): FloorPlan | null {
  try {
    const parsed = JSON.parse(json)
    // TODO: Add validation
    return parsed as FloorPlan
  } catch (e) {
    console.error('Failed to parse JSON:', e)
    return null
  }
}

// Export to SVG
export function exportToSVG(floorPlan: FloorPlan, options: {
  width?: number
  height?: number
  includeGrid?: boolean
} = {}): string {
  const { width = 800, height = 600, includeGrid = false } = options
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>
    </pattern>
  </defs>
  ${includeGrid ? '<rect width="100%" height="100%" fill="url(#grid)" />' : ''}
  <!-- Walls -->
  ${floorPlan.walls.map(wall => {
    const startPoint = floorPlan.points.find(p => p.id === wall.startPointId)
    const endPoint = floorPlan.points.find(p => p.id === wall.endPointId)
    if (!startPoint || !endPoint) return ''
    return `<line x1="${startPoint.x}" y1="${startPoint.y}" x2="${endPoint.x}" y2="${endPoint.y}" 
      stroke="${wall.color || '#374151'}" stroke-width="${wall.thickness * 100}" />`
  }).join('\n  ')}
  <!-- Rooms -->
  ${floorPlan.rooms.map(room => {
    const roomPoints = room.pointIds
      .map(id => floorPlan.points.find(p => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
    if (roomPoints.length < 3) return ''
    const points = roomPoints.map(p => `${p.x},${p.y}`).join(' ')
    return `<polygon points="${points}" fill="${room.floorColor || '#f3f4f6'}" stroke="#9ca3af" stroke-width="1" />`
  }).join('\n  ')}
</svg>`
  
  return svg
}

// Export to DXF (simplified)
export function exportToDXF(floorPlan: FloorPlan): string {
  let dxf = `0
SECTION
2
HEADER
0
ENDSEC
2
TABLES
0
ENDSEC
2
ENTITIES
`
  
  // Add walls as lines
  floorPlan.walls.forEach(wall => {
    const startPoint = floorPlan.points.find(p => p.id === wall.startPointId)
    const endPoint = floorPlan.points.find(p => p.id === wall.endPointId)
    if (!startPoint || !endPoint) return
    
    dxf += `0
LINE
8
Walls
10
${startPoint.x}
20
${startPoint.y}
30
0
11
${endPoint.x}
21
${endPoint.y}
31
0
`
  })
  
  dxf += `0
ENDSEC
0
EOF`
  
  return dxf
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export canvas to image
export async function exportCanvasToImage(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: 'low' | 'medium' | 'high' | 'ultra' = 'high'
): Promise<Blob> {
  const settings = EXPORT_QUALITY_SETTINGS[quality]
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      `image/${format}`,
      settings.jpegQuality
    )
  })
}

// Generate shareable link (mock implementation)
export async function generateShareLink(floorPlanId: string): Promise<string> {
  // In a real implementation, this would call an API
  const token = btoa(`${floorPlanId}:${Date.now()}`)
  return `${window.location.origin}/share/${token}`
}

// Validate export request
export function validateExportRequest(request: ExportRequest): string[] {
  const errors: string[] = []
  
  const validFormats = ['png', 'jpg', 'pdf', 'svg', 'dxf', 'obj', 'gltf', 'json']
  if (!validFormats.includes(request.format)) {
    errors.push(`Invalid format: ${request.format}`)
  }
  
  if (request.quality && !['low', 'medium', 'high', 'ultra'].includes(request.quality)) {
    errors.push(`Invalid quality: ${request.quality}`)
  }
  
  return errors
}
