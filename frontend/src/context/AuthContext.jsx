import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await api.get('/auth/me/', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
       
      if (error.name !== 'AbortError' && error.name !== 'CanceledError' && error.response?.status !== 401) {
        console.error('Auth status check failed:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
     
    const handleForceLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
     
    window.addEventListener('auth:logout', handleForceLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, [checkAuthStatus]);

  const login = useCallback(async (email, password, options = {}) => {
    const { showLoadingToast = true, showSuccessToast = true } = options;
    
    let loadingToast = null;
    
    try {
      if (showLoadingToast) {
        loadingToast = toast.loading('Signing you in...');
      }

      const response = await api.post('/auth/login/', { email, password });
       
      const userData = response.data.user || response.data;
      
      
      setUser(userData);
      setIsAuthenticated(true);
      
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      if (showSuccessToast) {
        toast.success(`Welcome back, ${userData.name}!`, {
          duration: 3000
        });
      }
      
      return { success: true, user: userData };
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
       let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response?.data?.non_field_errors?.length) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
       toast.error(errorMessage, {
        duration: 5000
       });
      
      return { 
        success: false, 
        error: errorMessage,
        fieldErrors: error.response?.data
      };
    }
  }, []);

  const register = useCallback(async (userData, options = {}) => {
    const { showLoadingToast = true, showSuccessToast = true } = options;
    
    let loadingToast = null;
    
    try {
      if (showLoadingToast) {
        loadingToast = toast.loading('Creating your account...');
      }

      const response = await api.post('/auth/register/', userData);
      
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      if (showSuccessToast) {
        toast.success('Account created. Please verify your email.', {
          duration: 4000,
        });
      }

      return { success: true };
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      let errorMessage = 'Registration failed. Please try again.';
      
       if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(' ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
       toast.error(errorMessage, {
        duration: 6000
       });
      
      return { 
        success: false, 
        error: errorMessage,
        fieldErrors: error.response?.data
      };
    }
  }, []);

  const logout = useCallback(async (options = {}) => {
    const { showToast = true, force = false } = options;
    
    if (!force && !isAuthenticated) {
      return;
    }
    
    try {
      if (isAuthenticated) {
        await api.post('/auth/logout/');
      }
      
      if (showToast) {
        toast.success('You have been logged out successfully', {
          duration: 3000
        });
      }
    } catch (error) {
       console.error('Logout request failed:', error);
      
      if (showToast) {
        toast.error('Logout request failed, but you have been logged out locally', {
          duration: 4000
        });
      }
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
    
    toast.success('Profile updated successfully', {
      duration: 3000
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/auth/me/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      
       if (error.response?.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    checkAuthStatus,
  }), [user, loading, isAuthenticated, login, register, logout, updateUser, refreshUser, checkAuthStatus]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
