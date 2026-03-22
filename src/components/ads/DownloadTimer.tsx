'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { Download, Clock, Shield } from 'lucide-react';
import { AdSlot } from './AdSlot';

interface DownloadTimerProps {
  downloadUrl: string;
  episodeTitle: string;
}

export function DownloadTimer({ downloadUrl, episodeTitle }: DownloadTimerProps) {
  const uniqueId = useId();
  const gradientId = `timer-gradient-${uniqueId.replace(/:/g, '')}`;
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isReady, setIsReady] = useState(false);
  const [turnstileVerified, setTurnstileVerified] = useState(false);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleStart = () => {
    setIsOpen(true);
    setCountdown(10);
    setIsReady(false);
    setTurnstileVerified(false);
  };

  const handleTurnstileCallback = useCallback(() => {
    setTurnstileVerified(true);
  }, []);

  // Load Turnstile widget when timer opens
  useEffect(() => {
    if (!isOpen) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      setTurnstileVerified(true); // Skip if no key configured
      return;
    }

    const turnstileId = `turnstile-${uniqueId.replace(/:/g, '')}`;
    const container = document.getElementById(turnstileId);
    if (!container) return;

    // @ts-expect-error — Turnstile global
    if (window.turnstile) {
      // @ts-expect-error — Turnstile global
      window.turnstile.render(`#${turnstileId}`, {
        sitekey: siteKey,
        callback: handleTurnstileCallback,
        theme: 'dark',
      });
    }
  }, [isOpen, handleTurnstileCallback, uniqueId]);

  const canDownload = isReady && turnstileVerified;

  return (
    <>
      <button
        onClick={handleStart}
        className="flex items-center gap-2 bg-surface-700 hover:bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-sm text-white transition-all hover:border-neon-blue group"
      >
        <Download className="h-4 w-4 text-neon-blue group-hover:scale-110 transition-transform" />
        Download
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-surface-800 border border-surface-600 rounded-2xl p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-1">Download</h3>
            <p className="text-gray-400 text-sm mb-6">{episodeTitle}</p>

            {/* Ad space during countdown */}
            <div className="flex justify-center mb-6">
              <AdSlot width={300} height={250} format="rectangle" />
            </div>

            {!isReady ? (
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="#1a1a25" strokeWidth="6" />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(1 - countdown / 10) * 220} 220`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{countdown}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  Aguarde {countdown} segundos...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div id={`turnstile-${uniqueId.replace(/:/g, '')}`} className="flex justify-center" />

                {canDownload ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center gap-2 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Download className="h-5 w-5" />
                    Baixar Agora
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-3">
                    <Shield className="h-4 w-4" />
                    Verificando que você é humano...
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
