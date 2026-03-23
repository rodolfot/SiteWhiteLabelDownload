'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

export function AdBlockDetector() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to fetch a common ad script path
        await fetch(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
          { method: 'HEAD', mode: 'no-cors' }
        );
        // If we get here, ads are not blocked
      } catch {
        // Method 2: Create a bait element
        const bait = document.createElement('div');
        bait.className = 'adsbox ad-placement textads banner-ads';
        bait.style.cssText = 'position:absolute;top:-10px;left:-10px;width:1px;height:1px;';
        document.body.appendChild(bait);

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (bait.offsetHeight === 0 || bait.clientHeight === 0) {
          setAdBlockDetected(true);
        }

        bait.remove();
      }
    };

    // Delay detection to not interfere with page load
    const timer = setTimeout(detectAdBlock, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {adBlockDetected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] backdrop-blur-lg flex items-center justify-center p-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--surface-900-hex) 98%, transparent)' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="max-w-md w-full bg-surface-800 border border-surface-600 rounded-2xl p-8 text-center shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              Bloqueador de Anúncios Detectado
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              O {siteConfig.name} e um servico gratuito mantido por anuncios. Para continuar
              utilizando nosso site, por favor desative seu bloqueador de anúncios e
              recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Já Desativei — Recarregar
            </button>
            <p className="text-gray-500 text-xs mt-4">
              Agradecemos sua compreensão e apoio!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
