import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('wb_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((role, email) => {
    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const next = { role, name: name || 'User', email };
    setUser(next);
    sessionStorage.setItem('wb_user', JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('wb_user');
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
