import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sweety_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sweety_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token with /auth/me on app mount
  useEffect(() => {
    async function verifyUser() {
      const savedToken = localStorage.getItem('sweety_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        setUser(data.user);
        localStorage.setItem('sweety_user', JSON.stringify(data.user));
      } catch (err) {
        console.warn('Session verification failed, signing out:', err);
        localStorage.removeItem('sweety_token');
        localStorage.removeItem('sweety_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyUser();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    localStorage.setItem('sweety_token', data.token);
    localStorage.setItem('sweety_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    localStorage.setItem('sweety_token', data.token);
    localStorage.setItem('sweety_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sweety_token');
    localStorage.removeItem('sweety_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

