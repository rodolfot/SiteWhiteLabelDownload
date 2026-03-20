'use client';

interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
  label?: string;
}

export function AdSlot({ width, height, className = '' }: AdSlotProps) {
  return (
    <div
      className={`ad-slot ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      {/* Replace this div with your ad network script */}
      <div className="text-gray-500 text-xs">
        Anúncio {width}x{height}
      </div>
    </div>
  );
}
