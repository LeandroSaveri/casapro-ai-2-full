import { useState } from 'react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-200"
          title="Zoom In"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Zoom Out"
        >
          <span className="text-lg font-bold">−</span>
        </button>
      </div>
      
      <button
        onClick={onReset}
        onMouseEnter={() => setShowReset(true)}
        onMouseLeave={() => setShowReset(false)}
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors text-sm font-medium"
        title="Reset View"
      >
        ⌂
      </button>
      
      <div className="bg-white/90 px-2 py-1 rounded shadow text-xs font-mono text-center">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
