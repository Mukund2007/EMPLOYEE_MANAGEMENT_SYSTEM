import { useState, useEffect } from 'react';
import { request } from '../services/api';

export const useAuth = (showNotification) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role');

    if (savedToken && savedUsername) {
      setUser({ token: savedToken, username: savedUsername, role: savedRole || 'ROLE_USER' });
    }

    const handleSessionExpired = () => {
      setUser(null);
      if (showNotification) {
        showNotification('Your session has expired. Please log in again.', 'error');
      }
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [showNotification]);

  const login = async (username, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);

    const userData = { token: data.token, username: data.username, role: data.role };
    setUser(userData);
    return userData;
  };

  const register = async (username, password, role) => {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);

    const userData = { token: data.token, username: data.username, role: data.role };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
  };

  return {
    user,
    login,
    register,
    logout,
  };
};
