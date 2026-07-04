export const environment = {
  production: false,
  apiUrl: '/api',
  apiTimeout: 30000,
  apiRetryAttempts: 3,
  mapboxToken: 'YOUR_MAPBOX_TOKEN', // Replace with actual token in production
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with actual key in production
  auth: {
    tokenPrefix: 'Bearer',
    loginRedirectUrl: '/',
    logoutRedirectUrl: '/login',
    unauthorizedRedirectUrl: '/login',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
  },
  socialAuth: {
    google: {
      clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual ID in production
    },
    facebook: {
      appId: 'YOUR_FACEBOOK_APP_ID', // Replace with actual ID in production
    },
  },
  sentry: {
    dsn: '', // Add Sentry DSN in production
    environment: 'development',
    tracesSampleRate: 1.0,
  },
  features: {
    darkMode: true,
    socialLogin: true,
    mapIntegration: true,
    notifications: true,
    chat: true,
  },
};