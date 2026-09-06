import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = (data) => {
    if (data?.accessToken) localStorage.setItem('skybook_token', data.accessToken);
    setUser(data?.user || null);
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const { data } = await authService.me();
        setUser(data.data);
      } catch (_err) {
        localStorage.removeItem('skybook_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      setUser,
      login: async (payload) => {
        const { data } = await authService.login(payload);
        persist(data.data);
        return data.data.user;
      },
      register: async (payload) => {
        const { data } = await authService.register(payload);
        persist(data.data);
        return data.data.user;
      },
      logout: async () => {
        await authService.logout().catch(() => {});
        localStorage.removeItem('skybook_token');
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
