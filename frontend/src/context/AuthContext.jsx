import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set default backend URL (relative in production, localhost in development)
  const API_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      // Fetch latest profile info to sync balance
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      if (res.data.success) {
        const updatedUser = {
          _id: res.data._id,
          username: res.data.username,
          email: res.data.email,
          balance: res.data.balance,
          token
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to sync profile', err);
      // If unauthorized (invalid token), log out
      if (err.response && err.response.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        const userData = res.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      if (res.data.success) {
        const userData = res.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const syncBalance = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API_URL, syncBalance }}>
      {children}
    </AuthContext.Provider>
  );
};
