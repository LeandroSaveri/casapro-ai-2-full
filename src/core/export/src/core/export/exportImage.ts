// src/core/export/exportImage.ts
export async function exportCanvasToImage(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' = 'png',
  quality: number = 1
): Promise<string> {
  return canvas.toDataURL(`image/${format}`, quality);
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToPDF(
  canvas2D: HTMLCanvasElement,
  canvas3D?: HTMLCanvasElement
): Promise<Blob> {
  // Usar biblioteca jsPDF no futuro
  // Por agora, retorna imagem como placeholder
  const dataUrl = await exportCanvasToImage(canvas2D, 'jpeg', 0.9);
  
  // Converter dataURL para Blob
  const response = await fetch(dataUrl);
  return response.blob();
}
