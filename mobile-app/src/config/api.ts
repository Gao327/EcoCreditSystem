// API Configuration
export const API_CONFIG = {
  // Development - local backend (port 8080 for API, 8081 for web app)
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:8080/api',
    WEB_APP_URL: 'http://localhost:8081',
    TIMEOUT: 10000,
  },
  // Production - deployed backend
  PRODUCTION: {
    BASE_URL: 'https://your-backend-domain.com/api',
    WEB_APP_URL: 'https://your-webapp-domain.com',
    TIMEOUT: 15000,
  },
};

// Get current environment
const getEnvironment = () => {
  // In a real app, you'd use environment variables
  // For now, we'll default to development
  return __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION';
};

// Export current API config
export const getApiConfig = () => {
  const env = getEnvironment();
  return API_CONFIG[env as keyof typeof API_CONFIG];
};

// Default API config for services
export const DEFAULT_API_CONFIG = getApiConfig(); 