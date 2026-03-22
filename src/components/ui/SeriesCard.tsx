'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Series } from '@/types/database';

interface SeriesCardProps {
  series: Series;
  index?: number;
}

export function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/serie/${series.slug}`} className="group block">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden card-hover">
          <Image
            src={series.poster_url || '/images/placeholder.svg'}
            alt={series.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--surface-900) 80%, transparent), transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-white font-semibold text-sm truncate">{series.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-300 text-xs">{series.year}</span>
              {series.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Star className="h-3 w-3 fill-current" />
                  {series.rating}
                </span>
              )}
            </div>
          </div>
          {series.featured && (
            <div className="absolute top-2 left-2 bg-neon-blue/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Destaque
            </div>
          )}
        </div>
        <div className="mt-2 group-hover:hidden">
          <h3 className="text-white font-medium text-sm truncate">{series.title}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{series.genre}</p>
        </div>
      </Link>
    </motion.div>
  );
}
