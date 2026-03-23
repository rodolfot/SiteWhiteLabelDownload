'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.className = saved === 'light' ? 'light' : '';
    }
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.className = next === 'light' ? 'light' : '';
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
      className="p-2 rounded-lg transition-all duration-200 hover:bg-surface-700"
      style={{ color: 'var(--text-secondary)' }}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
