import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('bms_city') || 'Mumbai';
  });

  const changeCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem('bms_city', city);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('bms_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('bms_user', JSON.stringify(res.data.data));
        } catch (err) {
          console.warn('Session expired or invalid.');
          setUser(null);
          localStorage.removeItem('bms_user');
          localStorage.removeItem('bms_access_token');
          localStorage.removeItem('bms_refresh_token');
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken, refreshToken } = res.data.data;
    setUser(userData);
    localStorage.setItem('bms_user', JSON.stringify(userData));
    localStorage.setItem('bms_access_token', accessToken);
    localStorage.setItem('bms_refresh_token', refreshToken);
    return userData;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { user: newUser, accessToken, refreshToken } = res.data.data;
    setUser(newUser);
    localStorage.setItem('bms_user', JSON.stringify(newUser));
    localStorage.setItem('bms_access_token', accessToken);
    localStorage.setItem('bms_refresh_token', refreshToken);
    return newUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem('bms_user');
    localStorage.removeItem('bms_access_token');
    localStorage.removeItem('bms_refresh_token');
  };

  const updateProfile = async (formData) => {
    const res = await api.put('/auth/profile', formData);
    const updated = res.data.data;
    setUser((prev) => ({ ...prev, ...updated }));
    localStorage.setItem('bms_user', JSON.stringify({ ...user, ...updated }));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        selectedCity,
        changeCity,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
