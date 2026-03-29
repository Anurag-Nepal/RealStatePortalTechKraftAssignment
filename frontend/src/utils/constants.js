


export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    ME: '/auth/me/',
  },
  PROPERTIES: '/properties/',
  FAVOURITES: '/favourites/',
  HEALTH: '/health/',
};


export const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
];


export const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];


export const USER_ROLES = {
  BUYER: 'buyer',
  AGENT: 'agent',
  ADMIN: 'admin',
};


export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];


export const PRICE_RANGES = {
  MIN: 0,
  MAX: 10000000, 
  STEP: 50000, 
};


export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,
  EMAIL_MAX_LENGTH: 254,
};


export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_REQUIREMENTS: 'Password must contain at least one uppercase letter and one number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  EMAIL_TOO_LONG: `Email must be less than ${VALIDATION_RULES.EMAIL_MAX_LENGTH} characters`,
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMIT: 'Too many requests. Please slow down.',
  SERVER_ERROR: 'Server error. Please try again later.',
};


export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  FAVORITE_ADDED: 'Property added to favorites',
  FAVORITE_REMOVED: 'Property removed from favorites',
  PROFILE_UPDATED: 'Profile updated successfully',
};


export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: '/properties/:id',
  FAVOURITES: '/favourites',
  NOT_FOUND: '/404',
};


export const STORAGE_KEYS = {
  THEME_MODE: 'themeMode',
  USER_PREFERENCES: 'userPreferences',
  PROPERTY_FILTERS: 'propertyFilters',
};


export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};


export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 900,
  LG: 1200,
  XL: 1536,
};


export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};


export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^\+?[\d\s\-()]+$/,
  PASSWORD_STRENGTH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
};


export const PLACEHOLDER_IMAGES = {
  PROPERTY: 'https://via.placeholder.com/400x300?text=Property+Image',
  AVATAR: 'https://via.placeholder.com/100x100?text=Avatar',
  LOGO: 'https://via.placeholder.com/200x50?text=Logo',
};


export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_MAP_VIEW: false,
  ENABLE_SAVED_SEARCHES: false,
};

export default {
  API_ENDPOINTS,
  PROPERTY_TYPES,
  BEDROOM_OPTIONS,
  USER_ROLES,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  PRICE_RANGES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  STORAGE_KEYS,
  THEME_MODES,
  BREAKPOINTS,
  ANIMATION_DURATION,
  HTTP_STATUS,
  REGEX_PATTERNS,
  PLACEHOLDER_IMAGES,
  FEATURE_FLAGS,
};