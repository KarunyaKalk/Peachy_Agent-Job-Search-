import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { mockApiEngine } from '../services/mockApi';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('peachy_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.warn('Backend API unreachable or unauthorized. Using local demo user context.');
      // Fallback local user context for GitHub Pages demo mode
      const savedUser = localStorage.getItem('peachy_mock_user_v1');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const mockUser: User = {
          id: 1,
          email: 'user@peachy.ai',
          full_name: 'Peachy User',
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      localStorage.setItem('peachy_token', response.data.access_token);
      await fetchCurrentUser();
    } catch (error) {
      console.warn('Backend login failed. Falling back to local demo authentication mode.');
      const res = mockApiEngine.login(email, password);
      localStorage.setItem('peachy_token', res.access_token);
      const mockUser: User = {
        id: 1,
        email: email.trim().toLowerCase(),
        full_name: 'Peachy User',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('peachy_mock_user_v1', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      await api.post<User>('/auth/register', { email, password, full_name: fullName });
      await login(email, password);
    } catch (error) {
      console.warn('Backend registration failed. Falling back to local demo registration mode.');
      const res = mockApiEngine.register(email, password, fullName);
      localStorage.setItem('peachy_token', res.access_token);
      const mockUser: User = {
        id: 1,
        email: email.trim().toLowerCase(),
        full_name: fullName || 'Peachy User',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem('peachy_mock_user_v1', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('peachy_token');
    localStorage.removeItem('peachy_mock_user_v1');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
