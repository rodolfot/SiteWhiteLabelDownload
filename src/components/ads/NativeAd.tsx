'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function NativeAd() {
  const adPushed = useRef(false);
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const adSlotNative = process.env.NEXT_PUBLIC_ADSENSE_NATIVE_SLOT_ID;

  useEffect(() => {
    if (!adClient || !adSlotNative || adPushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adPushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, [adClient, adSlotNative]);

  if (!adClient || !adSlotNative) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-700 border border-surface-600"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Patrocinado</div>
          <div className="w-full h-full bg-surface-600 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">Native Ad</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-700 border border-surface-600"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider">Patrocinado</div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client={adClient}
          data-ad-slot={adSlotNative}
          data-ad-format="fluid"
          data-ad-layout-key="-6t+ed+2i-1n-4w"
        />
      </div>
    </motion.div>
  );
}
