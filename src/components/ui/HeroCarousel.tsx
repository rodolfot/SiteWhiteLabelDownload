'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Series } from '@/types/database';

interface HeroCarouselProps {
  series: Series[];
}

export function HeroCarousel({ series }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (series.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % series.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [series.length]);

  if (series.length === 0) {
    return (
      <div className="relative h-[70vh] min-h-[500px] bg-surface-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            <span className="text-white">Down</span>
            <span className="text-gradient">Door</span>
          </h1>
          <p className="text-gray-400 text-lg">Seu portal para vídeos e downloads gratuitos</p>
        </div>
      </div>
    );
  }

  const item = series[current];

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={item.backdrop_url || item.poster_url || '/images/placeholder.svg'}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 gradient-overlay" />
          <div className="absolute inset-0 gradient-overlay-left w-2/3" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id + '-content'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <motion.h1
              className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {item.title}
            </motion.h1>

            <div className="flex items-center gap-3 mb-4 text-sm">
              {item.year && <span className="text-gray-300">{item.year}</span>}
              {item.genre && (
                <span className="bg-surface-600/80 text-gray-300 px-2 py-0.5 rounded">
                  {item.genre}
                </span>
              )}
              {item.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  {item.rating}
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
              {item.synopsis}
            </p>

            <div className="flex items-center gap-3">
              <Link href={`/serie/${item.slug}`} className="btn-primary flex items-center gap-2">
                <Play className="h-5 w-5 fill-current" />
                Assistir
              </Link>
              <Link href={`/serie/${item.slug}`} className="btn-secondary flex items-center gap-2">
                <Info className="h-5 w-5" />
                Mais Detalhes
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {series.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + series.length) % series.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % series.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {series.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-neon-blue' : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
