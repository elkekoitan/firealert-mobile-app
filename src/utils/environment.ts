// Environment configuration service
// Bu servis ortam değişkenlerini güvenli bir şekilde yönetir

const ENV = process.env.ENV_NAME || 'development';

// Ortam değişkenlerini almak için güvenli bir fonksiyon
const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

// Ortam bazlı konfigürasyon
export const environment = {
  // API Configuration
  api: {
    baseUrl: getEnvVariable('API_BASE_URL'),
    wsUrl: getEnvVariable('WS_URL'),
  },
  
  // Supabase Configuration
  supabase: {
    url: getEnvVariable('SUPABASE_URL'),
    anonKey: getEnvVariable('SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVariable('SUPABASE_SERVICE_ROLE_KEY'),
  },
  
  // External Services
  services: {
    firmsApiKey: getEnvVariable('FIRMS_API_KEY'),
    mapsApiKey: getEnvVariable('MAPS_API_KEY'),
    sentryDsn: getEnvVariable('SENTRY_DSN'),
  },
  
  // Environment Info
  env: {
    name: ENV,
    isDevelopment: ENV === 'development',
    isStaging: ENV === 'staging',
    isProduction: ENV === 'production',
  },
  
  // GitHub (CI/CD için)
  github: {
    token: getEnvVariable('GITHUB_TOKEN'),
  },
  
  // Expo
  expo: {
    username: getEnvVariable('EXPO_USERNAME'),
  },
};

// Ortam değişkenlerinin tip tanımı
export interface EnvironmentConfig {
  api: {
    baseUrl: string;
    wsUrl: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  services: {
    firmsApiKey: string;
    mapsApiKey: string;
    sentryDsn: string;
  };
  env: {
    name: string;
    isDevelopment: boolean;
    isStaging: boolean;
    isProduction: boolean;
  };
  github: {
    token: string;
  };
  expo: {
    username: string;
  };
}

// Debug için (sadece development ortamında)
if (environment.env.isDevelopment) {
  console.log('Environment Configuration:', {
    env: environment.env.name,
    apiBaseUrl: environment.api.baseUrl,
    supabaseUrl: environment.supabase.url,
  });
}