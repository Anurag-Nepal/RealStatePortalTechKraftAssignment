import api from './api.js';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login/', {
      email: email.trim(),
      password,
    });

    return response.data.user || response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.non_field_errors?.[0] ||
      'Login failed. Please check your credentials and try again.';
    
    throw new Error(errorMessage);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register/', {
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password,
      password_confirm: userData.password_confirm,
    });

    
    return response.data.user || response.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      const errorMessages = [];
      
      for (const [field, messages] of Object.entries(validationErrors)) {
        if (Array.isArray(messages)) {
          errorMessages.push(...messages);
        } else {
          errorMessages.push(messages);
        }
      }
      
      throw new Error(errorMessages.join(' '));
    }
    
    const errorMessage = 
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.non_field_errors?.[0] ||
      'Registration failed. Please try again.';
    
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout/');
  } catch (error) {
    console.warn('Logout request failed:', error.message);
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me/');
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message ||
      error.response?.data?.detail ||
      'Failed to get user information.';
    
    throw new Error(errorMessage);
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh/');
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message ||
      error.response?.data?.detail ||
      'Session expired. Please log in again.';
    
    throw new Error(errorMessage);
  }
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const result = {
    isValid: true,
    messages: [],
  };

  if (!password) {
    result.isValid = false;
    result.messages.push('Password is required');
    return result;
  }

  if (password.length < 8) {
    result.isValid = false;
    result.messages.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    result.isValid = false;
    result.messages.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    result.isValid = false;
    result.messages.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    result.isValid = false;
    result.messages.push('Password must contain at least one number');
  }

  return result;
};
