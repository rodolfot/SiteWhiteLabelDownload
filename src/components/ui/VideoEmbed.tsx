'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  title: string;
  posterUrl?: string;
}

const ALLOWED_EMBED_HOSTS = [
  'youtube.com', 'www.youtube.com', 'youtu.be',
  'player.twitch.tv', 'twitch.tv', 'www.twitch.tv',
  'kick.com', 'www.kick.com', 'player.kick.com',
] as const;

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_EMBED_HOSTS.some(
    host => hostname === host || hostname.endsWith(`.${host}`)
  );
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // Rejeitar protocolos inseguros
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;

    // Whitelist de domínios permitidos
    if (!isAllowedHost(u.hostname)) return null;

    // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let videoId = '';
      if (u.hostname.includes('youtu.be')) {
        videoId = u.pathname.slice(1);
      } else if (u.pathname.includes('/embed/')) {
        return url;
      } else {
        videoId = u.searchParams.get('v') || '';
      }
      if (videoId) return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;
    }

    // Twitch: twitch.tv/videos/ID or twitch.tv/CHANNEL
    if (u.hostname.includes('twitch.tv')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      if (parts[0] === 'videos' && parts[1]) {
        return `https://player.twitch.tv/?video=${encodeURIComponent(parts[1])}&parent=${encodeURIComponent(parent)}&autoplay=false`;
      }
      if (parts[0]) {
        return `https://player.twitch.tv/?channel=${encodeURIComponent(parts[0])}&parent=${encodeURIComponent(parent)}&autoplay=false`;
      }
    }

    // Kick: kick.com/CHANNEL or kick.com/video/ID
    if (u.hostname.includes('kick.com')) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({ url, title, posterUrl }: VideoEmbedProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) return null;

  if (!showPlayer) {
    return (
      <button
        onClick={() => setShowPlayer(true)}
        className="relative w-full aspect-video rounded-xl overflow-hidden group cursor-pointer"
        style={{ backgroundColor: 'var(--surface-700-hex)' }}
      >
        {posterUrl && (
          <img src={posterUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 transition-colors flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--surface-900-hex) 40%, transparent)' }}>
          <div className="w-16 h-16 rounded-full bg-neon-blue/90 flex items-center justify-center shadow-lg shadow-neon-blue/30 group-hover:scale-110 transition-transform">
            <Play className="h-7 w-7 text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 text-white text-sm font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--surface-900-hex) 60%, transparent)' }}>
          Assistir Trailer
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      />
    </div>
  );
}
