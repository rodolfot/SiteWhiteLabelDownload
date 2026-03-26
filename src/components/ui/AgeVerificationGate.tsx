'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';

const STORAGE_KEY = 'age_verified';
const EXPIRY_HOURS = 24;

function isAdultCategory(category: string[]): boolean {
  if (!Array.isArray(category)) return false;
  return category.some((c) => c.toLowerCase() === 'adulto' || c.toLowerCase() === 'adult' || c.toLowerCase() === '+18');
}

interface AgeVerificationGateProps {
  category: string[];
  children: ReactNode;
}

export function AgeVerificationGate({ category, children }: AgeVerificationGateProps) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [showGate, setShowGate] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  const isAdult = isAdultCategory(category);

  useEffect(() => {
    if (!isAdult) {
      setVerified(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expiry = new Date(parsed.timestamp).getTime() + EXPIRY_HOURS * 60 * 60 * 1000;
        if (Date.now() < expiry) {
          setVerified(true);
          return;
        }
      }
    } catch {}

    setShowGate(true);
    setVerified(false);
  }, [isAdult]);

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: new Date().toISOString() }));
    setVerified(true);
    setShowGate(false);
  };

  const handleDeny = () => {
    router.back();
  };

  // Non-adult content — render immediately
  if (!isAdult) return <>{children}</>;

  // Loading state
  if (verified === null) return null;

  // Verified — show content
  if (verified) return <>{children}</>;

  // Show gate
  return (
    <AnimatePresence>
      {showGate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-surface-800 border border-surface-600 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-6">
              <ShieldAlert className="h-12 w-12 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              {t.common.language === 'Idioma' ? 'Verificação de Idade' :
               t.common.language === 'Language' ? 'Age Verification' : 'Verificación de Edad'}
            </h2>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <span className="text-red-400 font-bold text-3xl">18+</span>
            </div>

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              {t.common.language === 'Idioma'
                ? 'Este conteúdo é destinado apenas para maiores de 18 anos. Ao continuar, você confirma que tem 18 anos ou mais.'
                : t.common.language === 'Language'
                ? 'This content is intended for adults only (18+). By continuing, you confirm that you are 18 years or older.'
                : 'Este contenido es solo para mayores de 18 años. Al continuar, confirmas que tienes 18 años o más.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-700 border border-surface-500 rounded-lg text-gray-300 hover:text-white hover:border-surface-400 transition-all text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.common.language === 'Idioma' ? 'Sou menor de 18' :
                 t.common.language === 'Language' ? 'I am under 18' : 'Soy menor de 18'}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg transition-all text-sm font-bold shadow-lg shadow-red-500/25"
              >
                {t.common.language === 'Idioma' ? 'Tenho 18+ anos' :
                 t.common.language === 'Language' ? 'I am 18+' : 'Tengo 18+ años'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Returns true if the category array contains an adult category.
 * Useful for showing 18+ badges on cards.
 */
export { isAdultCategory };
