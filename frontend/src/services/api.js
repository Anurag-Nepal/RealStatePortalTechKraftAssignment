import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }

  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      return data?.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return data?.message || 'Conflict. The resource already exists.';
    case 422:
      return data?.message || 'Invalid data provided.';
    case 429:
      return 'Too many requests. Please slow down and try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return data?.message || 'An unexpected error occurred.';
  }
};

const getValidationErrors = (error) => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === 'object') {
      return Object.entries(errors)
        .map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${messageArray.join(', ')}`;
        })
        .join('\n');
    }
  }
  return null;
};

api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata?.startTime;
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (process.env.NODE_ENV === 'development') {
      const duration = originalRequest?.metadata?.startTime 
        ? new Date() - originalRequest.metadata.startTime 
        : 0;
      console.error(`API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        error: error.response?.data || error.message
      });
    }

    const skipRefreshPaths = ['/auth/me/', '/auth/login/', '/auth/register/', '/auth/refresh/'];
    const shouldSkipRefresh = skipRefreshPaths.some(path => originalRequest.url?.includes(path));
    
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh/');
        
        processQueue(null);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        toast.error('Your session has expired. Please log in again.', {
          id: 'session-expired',
          duration: 5000
        });
        
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter 
        ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
        : 'Too many requests. Please slow down.';
      
      toast.error(message, {
        id: 'rate-limit',
        duration: 6000
      });
      
      console.warn(`Rate limited. Retry after ${retryAfter} seconds.`);
    }

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.', {
          id: 'timeout-error'
        });
      } else {
        toast.error('Network error. Please check your internet connection.', {
          id: 'network-error'
        });
      }
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Our team has been notified.', {
        id: 'server-error'
      });
    }

    error.userMessage = getErrorMessage(error);
    error.validationErrors = getValidationErrors(error);

    return Promise.reject(error);
  }
);

export const apiHelpers = {
  handleApiCall: async (apiCall, options = {}) => {
    const { 
      loadingMessage, 
      successMessage, 
      errorMessage,
      showSuccessToast = false,
      showErrorToast = true 
    } = options;

    try {
      if (loadingMessage) {
        toast.loading(loadingMessage, { id: 'api-loading' });
      }

      const response = await apiCall();

      if (loadingMessage) {
        toast.dismiss('api-loading');
      }

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return response;
    } catch (error) {
      if (loadingMessage) {
        toast.dismiss('api-loading');
      }

      if (showErrorToast) {
        const message = errorMessage || error.userMessage || 'An error occurred';
        
        if (error.validationErrors) {
          toast.error(`${message}\n\n${error.validationErrors}`, {
            duration: 6000
          });
        } else {
          toast.error(message);
        }
      }

      throw error;
    }
  },

  showLoadingToast: (message = 'Loading...') => {
    const toastId = toast.loading(message);
    return () => toast.dismiss(toastId);
  },

  showSuccessToast: (message, action = null) => {
    return toast.success(message, {
      duration: 4000,
      ...(action && {
        action: {
          label: action.label,
          onClick: action.onClick
        }
      })
    });
  },

  showErrorToast: (message, retryFn = null) => {
    return toast.error(message, {
      duration: 6000,
      ...(retryFn && {
        action: {
          label: 'Retry',
          onClick: retryFn
        }
      })
    });
  }
};

export default api;
