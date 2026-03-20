'use client';

import { motion } from 'framer-motion';

export function NativeAd() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-700 border border-surface-600"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Patrocinado</div>
        {/* Replace with native ad network content */}
        <div className="w-full h-full bg-surface-600 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">Native Ad</span>
        </div>
      </div>
    </motion.div>
  );
}
