'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
  label?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  slotId?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdSlot({ width, height, className = '', format = 'auto', slotId }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adPushed = useRef(false);
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlot = slotId || process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!adClient || !adSlot || adPushed.current || isDev) return;
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushed.current = true;
      } catch {
        // AdSense not loaded yet
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [adClient, adSlot, isDev]);

  // Show placeholder in dev or when not configured
  if (!adClient || !adSlot || isDev) {
    return (
      <div
        className={`ad-slot ${className}`}
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        <div className="w-full h-full bg-surface-700/50 border border-dashed border-surface-500 rounded-lg flex flex-col items-center justify-center">
          <div className="text-gray-500 text-xs uppercase tracking-wider">Anúncio</div>
          <div className="text-gray-600 text-[10px] mt-1">{width}x{height}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={`ad-slot ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: `${width}px`, height: `${height}px` }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
