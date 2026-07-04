/**
 * Development environment configuration
 * 
 * This file contains environment-specific configuration for development.
 * Values here should be suitable for local development and testing.
 */

export const environment = {
  production: false,

  // API Configuration
  apiUrl: '/api',
  apiTimeout: 30000, // 30 seconds
  apiRetryAttempts: 3,

  // Map Services Configuration
  mapboxToken: 'pk.development.token', // Development token with restricted usage
  googleMapsApiKey: 'development-maps-key',
  defaultMapCenter: {
    lat: 48.8566, // Paris coordinates
    lng: 2.3522
  },
  defaultMapZoom: 12,

  // Authentication Configuration
  auth: {
    tokenPrefix: 'Bearer',
    loginRedirectUrl: '/',
    logoutRedirectUrl: '/login',
    unauthorizedRedirectUrl: '/login',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },

  // Social Authentication Configuration
  socialAuth: {
    google: {
      clientId: 'development-client-id',
      scopes: ['profile', 'email']
    },
    facebook: {
      appId: 'development-app-id',
      scopes: ['email', 'public_profile']
    }
  },

  // Error Tracking Configuration
  sentry: {
    dsn: '', // Empty for development
    environment: 'development',
    tracesSampleRate: 1.0, // Capture all traces in development
    debug: true
  },

  // Feature Flags
  features: {
    darkMode: true,
    socialLogin: true,
    mapIntegration: true,
    notifications: true,
    chat: true,
    analytics: false, // Disabled in development
    errorReporting: false // Disabled in development
  },

  // Development Tools
  devTools: {
    enableDebugger: true,
    enableLogger: true,
    logLevel: 'debug',
    showDevTools: true
  },

  // Cache Configuration
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000, // 5 minutes
    maxSize: 100 // Maximum number of items to cache
  },

  // API Mocking Configuration
  mock: {
    enabled: false,
    delay: 0,
    errorRate: 0
  }
};