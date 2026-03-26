'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Copy, Check, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { useI18n } from '@/lib/i18n/context';

const donateConfig = {
  pix: process.env.NEXT_PUBLIC_DONATE_PIX || '',
  paypal: process.env.NEXT_PUBLIC_DONATE_PAYPAL || '',
  btc: process.env.NEXT_PUBLIC_DONATE_BTC || '',
  eth: process.env.NEXT_PUBLIC_DONATE_ETH || '',
};

export function DonateContent() {
  const { t } = useI18n();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasPix = !!donateConfig.pix;
  const hasPaypal = !!donateConfig.paypal;
  const hasCrypto = !!donateConfig.btc || !!donateConfig.eth;
  const hasAny = hasPix || hasPaypal || hasCrypto;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{t.donate.title}</h1>
          <p className="text-gray-400 text-lg">{t.donate.subtitle}</p>
          <p className="text-gray-500 text-sm mt-3">{t.donate.description.replace('{name}', siteConfig.name)}</p>
        </motion.div>

        {!hasAny ? (
          <div className="bg-surface-700/50 border border-surface-600 rounded-xl p-8 text-center">
            <p className="text-gray-400">{t.donate.noDonationMethods}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* PIX */}
            {hasPix && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-surface-700/50 border border-surface-600 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-2">{t.donate.pixTitle}</h2>
                <p className="text-gray-400 text-sm mb-4">{t.donate.pixDescription}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-surface-800 border border-surface-500 rounded-lg px-4 py-2.5 text-sm text-neon-blue font-mono truncate">
                    {donateConfig.pix}
                  </code>
                  <button
                    onClick={() => copyToClipboard(donateConfig.pix, 'pix')}
                    className="shrink-0 flex items-center gap-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {copiedField === 'pix' ? <><Check className="h-4 w-4" />{t.donate.pixCopied}</> : <><Copy className="h-4 w-4" />{t.donate.pixCopy}</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* PayPal */}
            {hasPaypal && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-surface-700/50 border border-surface-600 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-2">{t.donate.paypalTitle}</h2>
                <p className="text-gray-400 text-sm mb-4">{t.donate.paypalDescription}</p>
                <a
                  href={donateConfig.paypal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.donate.paypalButton}
                </a>
              </motion.div>
            )}

            {/* Crypto */}
            {hasCrypto && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-surface-700/50 border border-surface-600 rounded-xl p-6"
              >
                <h2 className="text-lg font-bold text-white mb-2">{t.donate.cryptoTitle}</h2>
                <p className="text-gray-400 text-sm mb-4">{t.donate.cryptoDescription}</p>
                <div className="space-y-3">
                  {donateConfig.btc && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Bitcoin (BTC)</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-surface-800 border border-surface-500 rounded-lg px-3 py-2 text-xs text-orange-400 font-mono truncate">
                          {donateConfig.btc}
                        </code>
                        <button
                          onClick={() => copyToClipboard(donateConfig.btc, 'btc')}
                          className="shrink-0 flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                          {copiedField === 'btc' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedField === 'btc' ? t.donate.cryptoCopied : t.donate.cryptoCopy}
                        </button>
                      </div>
                    </div>
                  )}
                  {donateConfig.eth && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">Ethereum (ETH)</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-surface-800 border border-surface-500 rounded-lg px-3 py-2 text-xs text-purple-400 font-mono truncate">
                          {donateConfig.eth}
                        </code>
                        <button
                          onClick={() => copyToClipboard(donateConfig.eth, 'eth')}
                          className="shrink-0 flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                        >
                          {copiedField === 'eth' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedField === 'eth' ? t.donate.cryptoCopied : t.donate.cryptoCopy}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Thank you */}
        {hasAny && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <p className="text-pink-400 font-semibold">{t.donate.thankYou}</p>
            <p className="text-gray-500 text-sm mt-1">{t.donate.thankYouMessage}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
