import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));
  const toast = useToast();

  // გვერდის გახსნისას სესიის აღდგენა
  useEffect(() => {
    if (!tokenStore.get()) { setLoading(false); return; }
    let alive = true;
    api.me()
      .then(({ user: u }) => { if (alive) setUser(u); })
      .catch(() => { tokenStore.set(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.login(credentials);
    tokenStore.set(res.token);
    setUser(res.user);
    toast.success(res.message || 'წარმატებით შეხვედით');
    return res.user;
  }, [toast]);

  const register = useCallback(async (payload) => {
    const res = await api.register(payload);
    tokenStore.set(res.token);
    setUser(res.user);
    toast.success('რეგისტრაცია წარმატებით დასრულდა', `მოგესალმებით, ${res.user.firstName}!`);
    return res.user;
  }, [toast]);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
    toast.info('თქვენ გამოხვედით სისტემიდან');
  }, [toast]);

  const updateProfile = useCallback(async (payload) => {
    const res = await api.updateMe(payload);
    setUser(res.user);
    toast.success(res.message || 'მონაცემები წარმატებით განახლდა');
    return res.user;
  }, [toast]);

  const value = useMemo(() => ({
    user, loading,
    isAuth: Boolean(user),
    isAdmin: user?.role === 'admin',
    login, register, logout, updateProfile,
  }), [user, loading, login, register, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth უნდა გამოიყენოთ AuthProvider-ის შიგნით');
  return ctx;
}
