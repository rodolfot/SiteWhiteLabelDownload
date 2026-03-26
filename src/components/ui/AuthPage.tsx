'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useI18n } from '@/lib/i18n/context';
import { useRouter } from 'next/navigation';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, signOut } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  // If already logged in, show account info
  if (user) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="max-w-md mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-surface-700/50 border border-surface-600 rounded-xl p-8 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-blue/10 mb-4">
              <User className="h-8 w-8 text-neon-blue" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{t.auth.myAccount}</h1>
            <p className="text-gray-400 text-sm mb-1">{user.email}</p>
            {user.user_metadata?.nickname && (
              <p className="text-gray-500 text-xs mb-6">{user.user_metadata.nickname}</p>
            )}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/favoritos')}
                className="w-full bg-surface-600 hover:bg-surface-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {t.auth.myFavorites}
              </button>
              <button
                onClick={() => signOut()}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {t.auth.logout}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) { setError(t.auth.emailRequired); return; }
    if (password.length < 6) { setError(t.auth.passwordMin); return; }
    if (mode === 'register' && !nickname) { setError(t.auth.nickRequired); return; }

    setLoading(true);
    if (mode === 'login') {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
      else setSuccess(t.auth.loginSuccess);
    } else {
      const result = await signUp(email, password, nickname);
      if (result.error) setError(result.error);
      else setSuccess(t.auth.registerSuccess);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-md mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface-700/50 border border-surface-600 rounded-xl p-8"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon-blue/10 mb-3">
              {mode === 'login' ? <LogIn className="h-6 w-6 text-neon-blue" /> : <UserPlus className="h-6 w-6 text-neon-blue" />}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t.auth.nickname}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-surface-800 border border-surface-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue transition-colors"
                    placeholder={t.auth.nickname}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t.auth.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue transition-colors"
                  placeholder={t.auth.email}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t.auth.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-800 border border-surface-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-blue transition-colors"
                  placeholder={t.auth.password}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-blue hover:bg-neon-blue/80 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? '...' : mode === 'login' ? t.auth.login : t.auth.register}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              className="text-sm text-gray-400 hover:text-neon-blue transition-colors"
            >
              {mode === 'login' ? t.auth.noAccount : t.auth.hasAccount}{' '}
              <span className="text-neon-blue font-medium">
                {mode === 'login' ? t.auth.register : t.auth.login}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
