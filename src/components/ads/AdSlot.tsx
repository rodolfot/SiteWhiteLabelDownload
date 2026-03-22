'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  width: number;
  height: number;
  className?: string;
  label?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdSlot({ width, height, className = '', format = 'auto' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adPushed = useRef(false);
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  useEffect(() => {
    if (!adClient || !adSlot || adPushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adPushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, [adClient, adSlot]);

  if (!adClient || !adSlot) {
    return (
      <div
        className={`ad-slot ${className}`}
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        <div className="text-gray-500 text-xs">
          Anuncio {width}x{height}
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
