'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import type { User } from '@/types';

export function useCurrentUser() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: User }>('/auth/me')
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
