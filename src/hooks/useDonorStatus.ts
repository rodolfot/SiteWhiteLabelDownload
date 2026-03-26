'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';

export function useDonorStatus() {
  const { user } = useAuth();
  const [isDonor, setIsDonor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsDonor(false);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from('user_donations')
      .select('id')
      .eq('user_id', user.id)
      .eq('active', true)
      .limit(1)
      .then(({ data }) => {
        setIsDonor((data || []).length > 0);
        setLoading(false);
      });
  }, [user]);

  return { isDonor, loading, user };
}
