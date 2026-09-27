import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosClient } from '../api/axiosClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const savedToken = localStorage.getItem('aura_auth_token');
      if (savedToken) {
        try {
          const { data } = await axiosClient.get('/auth/me');
          if (data.success && data.data && data.data.role === 'ADMIN') {
            setUser(data.data);
          } else {
            localStorage.removeItem('aura_auth_token');
            setUser(null);
          }
        } catch (e) {
          console.warn('Saved admin token invalid or expired');
          localStorage.removeItem('aura_auth_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', {
      email,
      password,
      portal: 'ADMIN',
    });

    if (data.success) {
      const { user: userObj, token } = data.data;
      localStorage.setItem('aura_auth_token', token);
      setUser(userObj);
      return data;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const logout = () => {
    localStorage.removeItem('aura_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

