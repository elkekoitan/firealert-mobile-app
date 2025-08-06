// Environment configuration service
// Bu servis ortam değişkenlerini güvenli bir şekilde yönetir

const ENV = process.env.ENV_NAME || 'development';

// Ortam değişkenlerini almak için güvenli bir fonksiyon
const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  return value;
};

// Ortam bazlı konfigürasyon
export const environment = {
  // API Configuration
  api: {
    baseUrl: getEnvVariable('API_BASE_URL', 'https://firealert-api.herokuapp.com'),
    wsUrl: getEnvVariable('WS_URL', 'wss://firealert-api.herokuapp.com'),
  },
  
  // Supabase Configuration
  supabase: {
    url: getEnvVariable('SUPABASE_URL', 'https://hddwvgvoqxgbtajwhvqqs.supabase.co'),
    anonKey: getEnvVariable('SUPABASE_ANON_KEY', 'eyJhbaGciOiJIUzI1NiIsInR5cCI6IlkpXVCJ9.eyJpc3MiOiJzdXBhaYmFzZSIsInJlZiI6ImhkZHd2rZ3ZxeGdidGFqd2h2cXFzIiwidcm9sZSI6ImFub24iLCJpYXQiaOjE3NTQ0Nzc0NTIsImV4cCI6 MjA3MDA1MzQ1Mn0.mODUafESs0VmAhdPXKPTeGt2JspWOeHKxoj79zXl1zERE'),
    serviceRoleKey: getEnvVariable('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUnzI1NiIsInR5cCI6IkpXVCJ9.eyJp c3MiOiJzdXBhYmFzZSIsInJlZiI6yImhkZHd2Z3ZxeGdidGFqd2h2cXFzaIiwicm9sZSI6InNlcnZpY2Vfcm9spZSIsImlhdCI6MTc1NDQ3NzQ1MiwiıZXhwIjoyMDcwMDUzNDUyfQ.zu-HTlqZXJXwHgyXk1cAamCd1dzFubPwVuaW8SVIBRwbI'),
  },
  
  // External Services
  services: {
    firmsApiKey: getEnvVariable('FIRMS_API_KEY', ''),
    mapsApiKey: getEnvVariable('MAPS_API_KEY', ''),
    sentryDsn: getEnvVariable('SENTRY_DSN', 'sntryu_644f1f2e84cn0452012fe1f307a5920795a783bea184 3c9f53d140373c9818662'),
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
    token: getEnvVariable('GITHUB_TOKEN', ''),
  },
  
  // Expo
  expo: {
    username: getEnvVariable('EXPO_USERNAME', 'firealert'),
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