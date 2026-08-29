import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.js';
import api from '../api/client.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  demoLogin: (roleKey: string) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
      localStorage.removeItem('edusphere_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('edusphere_token');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.token) {
        localStorage.setItem('edusphere_token', res.token);
        setUser(res.user);
        return res.user;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleKey: string): Promise<string> => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(roleKey);
      if (res.token) {
        localStorage.setItem('edusphere_token', res.token);
        setUser(res.user);
        return res.targetUrl || (roleKey === 'student' ? '/student/dashboard' : roleKey === 'faculty' ? '/faculty/dashboard' : '/admin/command-center');
      }
      return '/';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('edusphere_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, demoLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
